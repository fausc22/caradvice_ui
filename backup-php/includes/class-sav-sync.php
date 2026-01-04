<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SAV_Sync {
    public static function init() {
        add_action('sav_cron_hook', [__CLASS__, 'run_cron']);
        add_action('wp_ajax_sav_get_page', [__CLASS__, 'ajax_get_page']);
        add_action('wp_ajax_sav_process_vehicle', [__CLASS__, 'ajax_process_vehicle']);
        add_action('wp_ajax_sav_find_pending_images', [__CLASS__, 'ajax_find_pending_images']);
        add_action('wp_ajax_sav_process_single_image', [__CLASS__, 'ajax_process_single_image']);
        add_action('wp_ajax_sav_reset_timestamps', [__CLASS__, 'ajax_reset_timestamps']);
        add_action('wp_ajax_sav_get_server_log', [__CLASS__, 'ajax_get_server_log']);
    }

    public static function activate() {
        if (!wp_next_scheduled('sav_cron_hook')) {
            wp_schedule_event(time(), 'hourly', 'sav_cron_hook');
        }
    }

    public static function deactivate() {
        wp_clear_scheduled_hook('sav_cron_hook');
    }

    public static function run_cron() {
        if (get_option('sav_cron_enabled', 'on') !== 'on') {
            SAV_Log::log("CRON: Desactivado en configuración.");
            return;
        }
        
        SAV_Log::log("CRON: ===== INICIO SINCRONIZACIÓN =====");
        
        $api = new SAV_Api();
        $page = 1;
        $total_processed = 0;
        
        // FASE 1: Sincronizar datos
        SAV_Log::log("CRON: Fase 1 - Sincronizando datos...");
        
        while (true) {
            $result = $api->get_vehicles_page($page);
            
            if (is_wp_error($result)) {
                SAV_Log::log("CRON: Error en API: " . $result->get_error_message());
                break;
            }
            
            $vehicles = $result['vehicles'] ?? [];
            $pagination = $result['pagination'] ?? [];
            
            if (empty($vehicles)) {
                SAV_Log::log("CRON: No hay más vehículos (página {$page})");
                break;
            }
            
            $total_pages = $pagination['pages'] ?? 1;
            $current_page = $pagination['page'] ?? $page;
            
            SAV_Log::log("CRON: Procesando página {$current_page}/{$total_pages} - " . count($vehicles) . " vehículos");
            
            foreach ($vehicles as $vehicle) {
                $asofix_id = $vehicle['id'] ?? null;
                if (!$asofix_id) continue;
                
                // FILTRO DE UBICACIONES BLOQUEADAS
                if (self::is_blocked_location($vehicle)) {
                    SAV_Log::log("CRON: Vehículo {$asofix_id} BLOQUEADO por ubicación");
                    continue;
                }
                
                // FILTRO DE CONDICIÓN "NUEVO"
                if (self::is_blocked_condition($vehicle)) {
                    SAV_Log::log("CRON: Vehículo {$asofix_id} BLOQUEADO (0km/Nuevo)");
                    continue;
                }
                
                $existing_post_id = self::find_post_by_asofix_id($asofix_id);
                
                if ($existing_post_id) {
                    $local_timestamp = (int)get_post_meta($existing_post_id, '_sav_last_update', true);
                    $api_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
                    
                    if ($api_timestamp > $local_timestamp) {
                        self::update_post($existing_post_id, $vehicle);
                        SAV_Log::log("CRON: Post {$existing_post_id} ACTUALIZADO");
                        $total_processed++;
                    }
                } else {
                    $new_post_id = self::create_post($vehicle);
                    if (!is_wp_error($new_post_id)) {
                        SAV_Log::log("CRON: Post {$new_post_id} CREADO");
                        $total_processed++;
                    }
                }
            }
            
            if ($current_page >= $total_pages) {
                SAV_Log::log("CRON: Última página alcanzada ({$current_page}/{$total_pages})");
                break;
            }
            
            $page++;
            sleep(1);
        }
        
        SAV_Log::log("CRON: Fase 1 completada - {$total_processed} vehículos procesados");
        
        // FASE 2: Procesar imágenes pendientes (200 por hora)
        SAV_Log::log("CRON: Fase 2 - Procesando imágenes...");
        
        global $wpdb;
        $results = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue' LIMIT 200");
        
        $images_processed = 0;
        
        foreach ($results as $result) {
            $post_id = $result->post_id;
            $urls = maybe_unserialize($result->meta_value);
            
            if (!empty($urls)) {
                foreach ($urls as $index => $url) {
                    $attachment_id = self::sideload_image($url, $post_id);
                    
                    if (!is_wp_error($attachment_id)) {
                        $temp_gallery = get_post_meta($post_id, '_sav_temp_gallery', true) ?: [];
                        $temp_gallery[$index] = $attachment_id;
                        update_post_meta($post_id, '_sav_temp_gallery', $temp_gallery);
                        
                        $queue = get_post_meta($post_id, '_sav_image_queue', true) ?: [];
                        if (($key = array_search($url, $queue)) !== false) {
                            unset($queue[$key]);
                        }
                        
                        if (empty($queue)) {
                            ksort($temp_gallery);
                            $final_ids = array_values($temp_gallery);
                            update_post_meta($post_id, 'vehica_6673', implode(',', $final_ids));
                            if (!empty($final_ids)) {
                                set_post_thumbnail($post_id, $final_ids[0]);
                            }
                            delete_post_meta($post_id, '_sav_temp_gallery');
                            delete_post_meta($post_id, '_sav_image_queue');
                            wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
                            SAV_Log::log("CRON: Post {$post_id} PUBLICADO con imágenes");
                        } else {
                            update_post_meta($post_id, '_sav_image_queue', $queue);
                        }
                        
                        $images_processed++;
                    }
                    
                    break; // Solo 1 imagen por post en cada ejecución
                }
            }
        }
        
        SAV_Log::log("CRON: Fase 2 completada - {$images_processed} imágenes procesadas");
        SAV_Log::log("CRON: ===== FIN SINCRONIZACIÓN =====");
    }

    private static function is_blocked_location($vehicle) {
        $blocked = get_option('sav_blocked_locations', '');
        if (empty($blocked)) return false;
        
        $blocked_keywords = array_map('trim', explode("\n", strtolower($blocked)));
        
        $stocks = $vehicle['stocks'] ?? [];
        foreach ($stocks as $stock) {
            $location = strtolower($stock['location_name'] ?? '');
            $branch = strtolower($stock['branch_office_name'] ?? '');
            
            foreach ($blocked_keywords as $keyword) {
                if (empty($keyword)) continue;
                if (strpos($location, $keyword) !== false || strpos($branch, $keyword) !== false) {
                    return true;
                }
            }
        }
        
        return false;
    }

    private static function is_blocked_condition($vehicle) {
        $condition = strtolower($vehicle['car_condition'] ?? '');
        return in_array($condition, ['new', 'nuevo', '0km']);
    }

    public static function ajax_get_page() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $api = new SAV_Api();
        $result = $api->get_vehicles_page($page);
        
        if (is_wp_error($result)) {
            wp_send_json_error(['message' => $result->get_error_message()]);
        } else {
            wp_send_json_success($result);
        }
    }

    public static function ajax_process_vehicle() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        $data = json_decode(stripslashes($_POST['vehicle_data']), true);
        $asofix_id = $data['id'] ?? null;
        
        if (!$asofix_id) {
            wp_send_json_error(['message' => 'ID de Asofix no encontrado.']);
            return;
        }
        
        // FILTRO DE UBICACIONES BLOQUEADAS
        if (self::is_blocked_location($data)) {
            wp_send_json_success(['message' => "Vehículo {$asofix_id} BLOQUEADO por ubicación."]);
            return;
        }
        
        // FILTRO DE CONDICIÓN "NUEVO"
        if (self::is_blocked_condition($data)) {
            wp_send_json_success(['message' => "Vehículo {$asofix_id} BLOQUEADO (0km/Nuevo)."]);
            return;
        }

        $existing_post_id = self::find_post_by_asofix_id($asofix_id);
        
        if ($existing_post_id) {
            $local_timestamp = (int)get_post_meta($existing_post_id, '_sav_last_update', true);
            $api_timestamp = isset($data['updated_at']) ? strtotime($data['updated_at']) : 0;
            
            if ($api_timestamp > $local_timestamp) {
                self::update_post($existing_post_id, $data);
                wp_send_json_success(['message' => "Post {$existing_post_id} ACTUALIZADO."]);
            } else {
                wp_send_json_success(['message' => "Post {$existing_post_id} OMITIDO (sin cambios)."]);
            }
        } else {
            $new_post_id = self::create_post($data);
            if (is_wp_error($new_post_id)) {
                wp_send_json_error(['message' => $new_post_id->get_error_message()]);
            } else {
                wp_send_json_success(['message' => "Post {$new_post_id} CREADO."]);
            }
        }
    }

    private static function find_post_by_asofix_id($asofix_id) {
        global $wpdb;
        $post_id = $wpdb->get_var($wpdb->prepare(
            "SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = '_asofix_id' AND meta_value = %s",
            $asofix_id
        ));
        return $post_id ? (int)$post_id : null;
    }

    private static function create_post($data) {
        $has_images = !empty($data['images']);
        
        $post_data = [
            'post_type'    => 'vehica_car',
            'post_title'   => ($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '') . ' ' . ($data['version'] ?? ''),
            'post_content' => $data['description'] ?? '',
            'post_status'  => $has_images ? 'draft' : 'publish',
        ];
        
        $post_id = wp_insert_post($post_data);
        if (is_wp_error($post_id)) return $post_id;

        self::set_all_meta($post_id, $data);
        return $post_id;
    }

    private static function update_post($post_id, $data) {
        $has_images = !empty($data['images']);
        
        $post_data = [
            'ID'           => $post_id,
            'post_title'   => ($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '') . ' ' . ($data['version'] ?? ''),
            'post_content' => $data['description'] ?? '',
            'post_status'  => $has_images ? 'draft' : 'publish',
        ];
        
        wp_update_post($post_data);
        self::set_all_meta($post_id, $data);
    }

    private static function set_all_meta($post_id, $data) {
        // IDs y timestamps
        update_post_meta($post_id, '_asofix_id', $data['id']);
        update_post_meta($post_id, 'vehica_29075', $data['id']);
        
        $api_timestamp = isset($data['updated_at']) ? strtotime($data['updated_at']) : 0;
        update_post_meta($post_id, '_sav_last_update', $api_timestamp);

        // Año y Kilómetros
        update_post_meta($post_id, 'vehica_14696', $data['year'] ?? '');
        update_post_meta($post_id, 'vehica_6664', $data['kilometres'] ?? '0');
        
        // Matrícula
        update_post_meta($post_id, 'vehica_6671', $data['license_plate'] ?? '');

        // Taxonomías: Marca (vehica_6659)
        if (!empty($data['brand_name'])) {
            self::set_taxonomy($post_id, 'vehica_6659', $data['brand_name']);
        }
        
        // Modelo (vehica_6660)
        if (!empty($data['model_name'])) {
            self::set_taxonomy($post_id, 'vehica_6660', $data['model_name']);
        }
        
        // Condición (vehica_6654)
        $condition_map = ['used' => 'Usado', 'new' => 'Nuevo', '0km' => '0 KM'];
        $condition = $condition_map[strtolower($data['car_condition'] ?? '')] ?? 'Usado';
        self::set_taxonomy($post_id, 'vehica_6654', $condition);
        
        // Transmisión (vehica_6662) - CAMPO CORRECTO DE LA API
        if (!empty($data['car_transmission'])) {
            self::set_taxonomy($post_id, 'vehica_6662', $data['car_transmission']);
        }
        
        // Combustible (vehica_6663) - CAMPO CORRECTO DE LA API
        if (!empty($data['car_fuel_type'])) {
            self::set_taxonomy($post_id, 'vehica_6663', $data['car_fuel_type']);
        }
        
        // Tipo/Segmento (vehica_6666)
        if (!empty($data['segment'])) {
            self::set_taxonomy($post_id, 'vehica_6666', $data['segment']);
        }
        
        // Color (vehica_6655) - CAMPO CORRECTO DE LA API
        if (!empty($data['colors'][0]['name'])) {
            self::set_taxonomy($post_id, 'vehica_6655', $data['colors'][0]['name']);
        }

        // PRECIO - CAMPO CORRECTO DE LA API
        $pricing = $data['price'] ?? [];
        $sale_price = (float)($pricing['sale_price'] ?? 0);
        $currency = $pricing['currency_name'] ?? '';
        
        update_post_meta($post_id, 'vehica_price_type_6656', 2316);
        
        if ($sale_price > 0) {
            if (stripos($currency, 'dolar') !== false) {
                // Precio en USD
                update_post_meta($post_id, 'vehica_currency_6656_2316', $sale_price);
            } else {
                // Precio en ARS
                update_post_meta($post_id, 'vehica_currency_6656_2316', $sale_price);
            }
        }

        // Imágenes - CON ANTI-DUPLICACIÓN
        if (!empty($data['images'])) {
            $existing_gallery = get_post_meta($post_id, 'vehica_6673', true);
            
            // Si ya tiene galería completa, NO agregar a cola
            if (!empty($existing_gallery)) {
                $gallery_ids = explode(',', $existing_gallery);
                $expected_count = count($data['images']);
                
                // Si tiene la cantidad correcta de imágenes, omitir descarga
                if (count($gallery_ids) >= $expected_count) {
                    delete_post_meta($post_id, '_sav_image_queue');
                    return;
                }
            }
            
            // Verificar qué imágenes ya están descargadas
            $image_urls = array_column($data['images'], 'url');
            $new_urls = [];
            
            foreach ($image_urls as $url) {
                // Extraer nombre del archivo de la URL
                $filename = basename(parse_url($url, PHP_URL_PATH));
                
                // Buscar si ya existe un attachment con este nombre
                global $wpdb;
                $exists = $wpdb->get_var($wpdb->prepare(
                    "SELECT ID FROM {$wpdb->posts} 
                    WHERE post_type = 'attachment' 
                    AND post_parent = %d 
                    AND guid LIKE %s",
                    $post_id,
                    '%' . $wpdb->esc_like($filename) . '%'
                ));
                
                // Solo agregar a cola si NO existe
                if (!$exists) {
                    $new_urls[] = $url;
                }
            }
            
            if (!empty($new_urls)) {
                update_post_meta($post_id, '_sav_image_queue', $new_urls);
            } else {
                delete_post_meta($post_id, '_sav_image_queue');
            }
        } else {
            delete_post_meta($post_id, '_sav_image_queue');
        }
    }

    private static function set_taxonomy($post_id, $taxonomy, $value) {
        if (empty($value)) return;

        $term = get_term_by('name', $value, $taxonomy);
        
        if (!$term) {
            $result = wp_insert_term($value, $taxonomy);
            if (!is_wp_error($result)) {
                $term_id = $result['term_id'];
            } else {
                return;
            }
        } else {
            $term_id = $term->term_id;
        }

        wp_set_post_terms($post_id, [$term_id], $taxonomy);
        update_post_meta($post_id, $taxonomy, $term_id);
    }

    public static function ajax_find_pending_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        global $wpdb;
        $results = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue'");
        
        $image_jobs = [];
        foreach ($results as $result) {
            $urls = maybe_unserialize($result->meta_value);
            if (!empty($urls)) {
                foreach ($urls as $index => $url) {
                    $image_jobs[] = [
                        'post_id' => $result->post_id,
                        'image_url' => $url,
                        'image_order' => $index
                    ];
                }
            }
        }
        
        wp_send_json_success(['image_jobs' => $image_jobs]);
    }

    public static function ajax_process_single_image() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        $job = json_decode(stripslashes($_POST['job']), true);
        $post_id = (int)$job['post_id'];
        $image_url = esc_url_raw($job['image_url']);
        $image_order = (int)$job['image_order'];

        $attachment_id = self::sideload_image($image_url, $post_id);
        
        if (is_wp_error($attachment_id)) {
            wp_send_json_error(['message' => "Error en Post {$post_id}: " . $attachment_id->get_error_message()]);
            return;
        }

        $temp_gallery = get_post_meta($post_id, '_sav_temp_gallery', true) ?: [];
        $temp_gallery[$image_order] = $attachment_id;
        update_post_meta($post_id, '_sav_temp_gallery', $temp_gallery);

        $queue = get_post_meta($post_id, '_sav_image_queue', true) ?: [];
        if (($key = array_search($image_url, $queue)) !== false) {
            unset($queue[$key]);
        }

        if (empty($queue)) {
            ksort($temp_gallery);
            $final_ids = array_values($temp_gallery);
            update_post_meta($post_id, 'vehica_6673', implode(',', $final_ids));
            if (!empty($final_ids)) {
                set_post_thumbnail($post_id, $final_ids[0]);
            }
            delete_post_meta($post_id, '_sav_temp_gallery');
            delete_post_meta($post_id, '_sav_image_queue');
            wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
            wp_send_json_success(['message' => "Post {$post_id} PUBLICADO."]);
        } else {
            update_post_meta($post_id, '_sav_image_queue', $queue);
            wp_send_json_success(['message' => "Imagen para Post {$post_id} procesada."]);
        }
    }
    
    private static function sideload_image($url, $post_id) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $tmp = download_url($url, 300);
        if (is_wp_error($tmp)) return $tmp;
        
        preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $url, $matches);
        $file_array = [
            'name' => $matches ? basename($matches[0]) : 'asofix-image.jpg',
            'tmp_name' => $tmp
        ];
        
        $id = media_handle_sideload($file_array, $post_id);
        if (is_wp_error($id)) {
            @unlink($file_array['tmp_name']);
        }
        
        return $id;
    }

    public static function ajax_reset_timestamps() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        global $wpdb;
        $wpdb->query("DELETE FROM {$wpdb->postmeta} WHERE meta_key = '_sav_last_update'");
        wp_send_json_success(['message' => 'Timestamps reseteados.']);
    }

    public static function ajax_get_server_log() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce', '_ajax_nonce')) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        if (file_exists(SAV_LOG_FILE)) {
            wp_send_json_success(['log' => esc_html(file_get_contents(SAV_LOG_FILE))]);
        } else {
            wp_send_json_success(['log' => 'El archivo de log no existe.']);
        }
    }
}