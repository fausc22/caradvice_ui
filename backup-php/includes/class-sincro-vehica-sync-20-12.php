<?php
// class-sincro-vehica-sync.php - v145.14 FINAL
// v145.14: Lógica de precios EXACTA de Manus v69.0 + Draft-to-publish workflow
// PRECIO: Usa list_price + currency_name (igual que Manus)
if ( ! defined( 'ABSPATH' ) ) exit;

class Sincro_Vehica_Sync {

    public static function run_full_sync_cron() {
        if (get_option('sincro_vehica_cron_enabled', 'on') !== 'on') { 
            return; 
        }
        
        SAV_Log::info("[CRON] ===== INICIO SINCRONIZACIÓN AUTOMÁTICA =====");
        
        global $wpdb;
        $image_queue_key = '_sav_image_queue';
        $image_batch_size = 50;
        
        $pending_images = $wpdb->get_results($wpdb->prepare(
            "SELECT post_id, meta_value FROM $wpdb->postmeta WHERE meta_key = %s LIMIT %d", 
            $image_queue_key, 
            $image_batch_size
        ));
        
        if (!empty($pending_images)) {
            SAV_Log::info("[CRON] 🖼️ Tarea: Procesar lote de imágenes. " . count($pending_images) . " posts con imágenes encontradas.");
            $image_count = 0;
            
            foreach ($pending_images as $result) {
                $image_urls = maybe_unserialize($result->meta_value);
                
                if (!empty($image_urls) && is_array($image_urls)) {
                    self::delete_attached_images($result->post_id);
                    $gallery_ids = [];
                    
                    usort($image_urls, function($a, $b) {
                        $order_a = is_array($a) ? ($a['order'] ?? 0) : 0;
                        $order_b = is_array($b) ? ($b['order'] ?? 0) : 0;
                        return $order_a - $order_b;
                    });
                    
                    foreach ($image_urls as $image_data) {
                        $url = is_array($image_data) ? $image_data['url'] : $image_data;
                        
                        $attachment_id = self::sideload_image_with_curl($url, $result->post_id);
                        
                        if (!is_wp_error($attachment_id)) {
                            $gallery_ids[] = $attachment_id;
                            $image_count++;
                        } else {
                            SAV_Log::info("[CRON] ⚠️ Error al descargar imagen para Post ID {$result->post_id}: " . $attachment_id->get_error_message());
                        }
                        
                        sleep(2);
                    }
                    
                    if (!empty($gallery_ids)) {
                        update_post_meta($result->post_id, 'vehica_6673', implode(',', $gallery_ids));
                        set_post_thumbnail($result->post_id, $gallery_ids[0]);
                    }
                }
                
                delete_post_meta($result->post_id, $image_queue_key);
                delete_post_meta($result->post_id, '_temp_gallery_order');
                
                wp_update_post([
                    'ID' => $result->post_id,
                    'post_status' => 'publish'
                ]);
                SAV_Log::info("[CRON] ✓ Post {$result->post_id} PUBLICADO (imágenes completadas)");
            }
            
            SAV_Log::info("[CRON] ✅ Fin de tarea: Lote de {$image_count} imágenes procesado.");
            SAV_Log::info("[CRON] ===== FIN SINCRONIZACIÓN =====");
            return;
        }
        
        SAV_Log::info("[CRON] 📄 Tarea: Procesar datos de vehículos.");
        $api = new Sincro_Vehica_Api();
        $page = 1;
        $max_pages_cron = 1000; 
        $processed_vehicles_count = 0;
        
        $limit = (int) get_option('sincro_vehica_manual_limit', 0);
        $has_limit = ($limit > 0);
        SAV_Log::info("[CRON] Límite de procesamiento configurado en: " . ($has_limit ? $limit : 'SIN LÍMITE'));

        while ($page <= $max_pages_cron) {
            $response = $api->get_vehicles_page($page);
            
            if (is_wp_error($response) || empty($response['vehicles'])) {
                SAV_Log::info("[CRON] La API no devolvió vehículos en la página {$page}. Asumiendo fin de la lista.");
                break;
            }
            
            foreach ($response['vehicles'] as $vehicle) {
                if ($has_limit && $processed_vehicles_count >= $limit) {
                    break 2; 
                }
                self::process_single_vehicle_cron($vehicle);
                $processed_vehicles_count++;
            }
            
            if (!empty($response['pagination']) && is_array($response['pagination'])) {
                $current_page = (int)($response['pagination']['page'] ?? 0);
                $total_pages = (int)($response['pagination']['pages'] ?? 0);
                
                SAV_Log::info("[CRON] 📊 Paginación: página {$current_page} de {$total_pages}");
                
                if ($current_page > 0 && $total_pages > 0 && $current_page >= $total_pages) {
                    SAV_Log::info("[CRON] ✅ Última página de la API alcanzada (Página {$page}).");
                    break;
                }
            } else {
                SAV_Log::info("[CRON] ⚠️ Sin metadata de paginación en página {$page}");
            }
            
            $page++;
            usleep(100000);
        }
        
        SAV_Log::info("[CRON] ✅ Fin de tarea: {$processed_vehicles_count} vehículos de la API revisados.");
        SAV_Log::info("[CRON] 🧹 Tarea: Limpieza de vehículos no encontrados.");
        self::cleanup_phase_cron();
        SAV_Log::info("[CRON] ===== FIN SINCRONIZACIÓN =====");
    }

    private static function process_single_vehicle_cron($vehicle) {
        $asofix_id = $vehicle['id'] ?? null;
        if (!$asofix_id) { return; }

        list($should_process, $reason, $active_stock) = self::validate_vehicle_rules($vehicle, true);

        if ($should_process) {
            global $wpdb;
            
            $existing_post_id = $wpdb->get_var($wpdb->prepare(
                "SELECT p.ID FROM {$wpdb->posts} p 
                JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id 
                WHERE p.post_type = 'vehica_car' 
                AND p.post_status IN ('publish', 'draft', 'trash')
                AND pm.meta_key = %s 
                AND pm.meta_value = %s", 
                'asofix-id', 
                $asofix_id
            ));
            
            $dates_table = $wpdb->prefix . 'sav_sync_dates';
            
            if ($existing_post_id) {
                $wpdb->flush();
                $last_update_timestamp = (int)$wpdb->get_var($wpdb->prepare(
                    "SELECT last_update_ts FROM $dates_table WHERE post_id = %d", 
                    $existing_post_id
                ));
                
                $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
                $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
                
                if (!($current_update_timestamp > 0 && $last_update_timestamp > 0 && $current_update_timestamp <= $last_update_timestamp)) {
                    $post_id = $existing_post_id;
                    
                    $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
                    
                    $images = $vehicle['images'] ?? [];
                    $has_images = !empty($images);
                    
                    $new_status = $has_images ? 'draft' : 'publish';
                    
                    wp_update_post([
                        'ID' => $post_id,
                        'post_title' => $post_title,
                        'post_content' => sanitize_textarea_field($vehicle['description'] ?? ''),
                        'post_status' => $new_status
                    ]);
                    
                    self::assign_taxonomies($post_id, $vehicle);
                    self::set_meta_data($post_id, $vehicle, $active_stock);
                    $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
                    
                    if ($has_images) {
                        $new_image_urls = array_column($images, 'url');
                        $existing_images = self::get_existing_image_urls($post_id);
                        
                        $new_urls_set = array_flip($new_image_urls);
                        $existing_urls_set = array_flip($existing_images);
                        
                        $images_changed = (count($new_urls_set) != count($existing_urls_set)) || 
                                         (count(array_diff_key($new_urls_set, $existing_urls_set)) > 0);
                        
                        if ($images_changed) {
                            self::delete_attached_images($post_id);
                            
                            $image_queue = [];
                            foreach ($images as $index => $image) {
                                $image_queue[] = [
                                    'url' => $image['url'],
                                    'order' => $index
                                ];
                            }
                            update_post_meta($post_id, '_sav_image_queue', $image_queue);
                            SAV_Log::info("[CRON] ↻ ACTUALIZADO Post {$post_id} (DRAFT - esperando imágenes)");
                        } else {
                            wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
                            SAV_Log::info("[CRON] ↻ ACTUALIZADO Post {$post_id} (imágenes sin cambios)");
                        }
                    } else {
                        SAV_Log::info("[CRON] ↻ ACTUALIZADO Post {$post_id} (sin imágenes - publicado)");
                    }
                }
            } else {
                $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
                
                $images = $vehicle['images'] ?? [];
                $has_images = !empty($images);
                $initial_status = $has_images ? 'draft' : 'publish';
                
                $post_id = wp_insert_post([
                    'post_type' => 'vehica_car',
                    'post_status' => $initial_status,
                    'post_title' => $post_title,
                    'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')
                ]);
                
                if (!is_wp_error($post_id)) {
                    $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
                    $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
                    
                    self::assign_taxonomies($post_id, $vehicle);
                    self::set_meta_data($post_id, $vehicle, $active_stock);
                    $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
                    
                    if ($has_images) {
                        $image_queue = [];
                        foreach ($images as $index => $image) {
                            $image_queue[] = [
                                'url' => $image['url'],
                                'order' => $index
                            ];
                        }
                        update_post_meta($post_id, '_sav_image_queue', $image_queue);
                        SAV_Log::info("[CRON] ✓ CREADO Post {$post_id} (DRAFT - esperando imágenes)");
                    } else {
                        SAV_Log::info("[CRON] ✓ CREADO Post {$post_id} (sin imágenes - publicado)");
                    }
                }
            }
        } else {
            SAV_Log::info("[CRON] ⊘ OMITIDO: Vehículo {$asofix_id} - Razón: {$reason}");
        }
    }

    private static function cleanup_phase_cron() {
        $api = new Sincro_Vehica_Api();
        $all_api_ids = [];
        $current_page = 1;
        $max_pages = 1000;
        
        while ($current_page <= $max_pages) {
            $response = $api->get_vehicles_page($current_page);
            
            if (is_wp_error($response) || empty($response['vehicles'])) { 
                break; 
            }
            
            foreach ($response['vehicles'] as $vehicle) {
                list($should_process, $reason, $active_stock) = self::validate_vehicle_rules($vehicle, true);
                if ($should_process && !empty($vehicle['id'])) {
                    $all_api_ids[] = $vehicle['id'];
                }
            }
            
            if (!empty($response['pagination']) && is_array($response['pagination'])) {
                $current = (int)($response['pagination']['page'] ?? 0);
                $total = (int)($response['pagination']['pages'] ?? 0);
                
                if ($current > 0 && $total > 0 && $current >= $total) {
                    break;
                }
            }
            
            $current_page++;
        }
        
        if (empty($all_api_ids)) { 
            SAV_Log::info("[CRON] ⚠️ No se encontraron vehículos válidos en la API para la limpieza."); 
            return; 
        }
        
        global $wpdb;
        $website_vehicle_ids = $wpdb->get_results($wpdb->prepare(
            "SELECT p.ID, pm.meta_value AS asofix_id 
            FROM {$wpdb->posts} p 
            JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id 
            WHERE p.post_type = %s 
            AND p.post_status = %s 
            AND pm.meta_key = %s", 
            'vehica_car', 
            'publish', 
            'asofix-id'
        ));
        
        $deleted_count = 0;
        foreach ($website_vehicle_ids as $vehicle) {
            if (!in_array($vehicle->asofix_id, $all_api_ids)) {
                wp_delete_post($vehicle->ID, true);
                $deleted_count++;
            }
        }
        
        SAV_Log::info("[CRON] ✅ Fase 3 (Limpieza) completada. {$deleted_count} vehículos eliminados permanentemente.");
    }
    
    public static function ajax_start_phase_1() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        global $wpdb;
        $wpdb->delete($wpdb->postmeta, ['meta_key' => '_sav_image_queue']);
        $wpdb->delete($wpdb->postmeta, ['meta_key' => '_temp_gallery_order']);
        wp_send_json_success(['message' => 'Cola de imágenes reseteada.']);
    }

    public static function ajax_get_page() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $api = new Sincro_Vehica_Api();
        $result = $api->get_vehicles_page($page);
        
        if (is_wp_error($result)) { 
            wp_send_json_error(['message' => $result->get_error_message()]); 
        } else { 
            wp_send_json_success($result); 
        }
    }

    public static function ajax_process_post_no_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        $vehicle = json_decode(stripslashes($_POST['vehicle_data']), true);
        $asofix_id = $vehicle['id'] ?? null;
        
        if (!$asofix_id) { 
            wp_send_json_success(['message' => 'OMITIDO: Vehículo sin Asofix ID principal.']); 
            return; 
        }
        
        list($should_process, $reason, $active_stock) = self::validate_vehicle_rules($vehicle, false);

        if (!$should_process) {
            wp_send_json_success(['message' => "OMITIDO: Vehículo {$asofix_id} - Razón: {$reason}"]);
            return;
        }

        global $wpdb;
        
        $existing_post_id = $wpdb->get_var($wpdb->prepare(
            "SELECT p.ID FROM {$wpdb->posts} p 
            JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id 
            WHERE p.post_type = 'vehica_car' 
            AND p.post_status IN ('publish', 'draft', 'trash')
            AND pm.meta_key = %s 
            AND pm.meta_value = %s", 
            'asofix-id', 
            $asofix_id
        ));
        
        $dates_table = $wpdb->prefix . 'sav_sync_dates';
        
        if ($existing_post_id) {
            $wpdb->flush();
            $last_update_timestamp = (int)$wpdb->get_var($wpdb->prepare(
                "SELECT last_update_ts FROM $dates_table WHERE post_id = %d", 
                $existing_post_id
            ));
            
            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
            
            if ($current_update_timestamp > 0 && $last_update_timestamp > 0 && $current_update_timestamp <= $last_update_timestamp) {
                wp_send_json_success(['message' => "SIN CAMBIOS: Vehículo {$asofix_id} (timestamp no es nuevo)."]);
            } else {
                $post_id = $existing_post_id;
                
                $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
                
                $images = $vehicle['images'] ?? [];
                $has_images = !empty($images);
                $new_status = $has_images ? 'draft' : 'publish';
                
                wp_update_post([
                    'ID' => $post_id,
                    'post_title' => $post_title,
                    'post_content' => sanitize_textarea_field($vehicle['description'] ?? ''),
                    'post_status' => $new_status
                ]);
                
                self::assign_taxonomies($post_id, $vehicle);
                self::set_meta_data($post_id, $vehicle, $active_stock);
                $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
                
                if ($has_images) {
                    $new_image_urls = array_column($images, 'url');
                    $existing_images = self::get_existing_image_urls($post_id);
                    
                    $new_urls_set = array_flip($new_image_urls);
                    $existing_urls_set = array_flip($existing_images);
                    
                    $images_changed = (count($new_urls_set) != count($existing_urls_set)) || 
                                     (count(array_diff_key($new_urls_set, $existing_urls_set)) > 0);
                    
                    if ($images_changed) {
                        self::delete_attached_images($post_id);
                        
                        $image_queue = [];
                        foreach ($images as $index => $image) {
                            $image_queue[] = [
                                'url' => $image['url'],
                                'order' => $index
                            ];
                        }
                        update_post_meta($post_id, '_sav_image_queue', $image_queue);
                    } else {
                        wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
                    }
                }
                
                wp_send_json_success(['message' => "Post {$post_id} ACTUALIZADO."]);
            }
        } else {
            $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
            
            $images = $vehicle['images'] ?? [];
            $has_images = !empty($images);
            $initial_status = $has_images ? 'draft' : 'publish';
            
            $post_id = wp_insert_post([
                'post_type' => 'vehica_car',
                'post_status' => $initial_status,
                'post_title' => $post_title,
                'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')
            ]);
            
            if (is_wp_error($post_id)) { 
                wp_send_json_error(['message' => $post_id->get_error_message()]); 
                return; 
            }
            
            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
            
            self::assign_taxonomies($post_id, $vehicle);
            self::set_meta_data($post_id, $vehicle, $active_stock);
            $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
            
            if ($has_images) {
                $image_queue = [];
                foreach ($images as $index => $image) {
                    $image_queue[] = [
                        'url' => $image['url'],
                        'order' => $index
                    ];
                }
                update_post_meta($post_id, '_sav_image_queue', $image_queue);
            }
            
            wp_send_json_success(['message' => "Post {$post_id} CREADO para Asofix ID {$asofix_id}."]);
        }
    }

    public static function ajax_find_pending_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT post_id, meta_value FROM $wpdb->postmeta WHERE meta_key = %s", 
            '_sav_image_queue'
        ));
        
        $image_jobs = [];
        foreach ($results as $result) {
            $image_urls = maybe_unserialize($result->meta_value);
            if (!empty($image_urls) && is_array($image_urls)) {
                foreach ($image_urls as $index => $image_data) {
                    if (is_array($image_data)) {
                        $url = $image_data['url'];
                        $order = $image_data['order'] ?? $index;
                    } else {
                        $url = $image_data;
                        $order = $index;
                    }
                    
                    $image_jobs[] = [
                        'post_id' => $result->post_id, 
                        'image_url' => $url,
                        'image_order' => $order
                    ]; 
                }
            }
        }
        
        wp_send_json_success(['image_jobs' => $image_jobs]);
    }
    
    public static function ajax_process_single_image() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        $post_id = isset($_POST['post_id']) ? (int)$_POST['post_id'] : 0;
        $image_url = isset($_POST['image_url']) ? esc_url_raw($_POST['image_url']) : '';
        $image_order = isset($_POST['image_order']) ? (int)$_POST['image_order'] : 999;
        
        if (!$post_id || !$image_url) { 
            wp_send_json_error(['message' => 'Faltan parámetros.']); 
        }
        
        $attachment_id = self::sideload_image_with_curl($image_url, $post_id);
        
        if (is_wp_error($attachment_id)) {
            wp_send_json_error(['message' => 'Error: ' . $attachment_id->get_error_message()]);
            return;
        }
        
        $gallery_meta_key = 'vehica_6673';
        
        $temp_gallery = get_post_meta($post_id, '_temp_gallery_order', true) ?: [];
        $temp_gallery[$image_order] = $attachment_id;
        update_post_meta($post_id, '_temp_gallery_order', $temp_gallery);
        
        ksort($temp_gallery);
        $ordered_ids = array_values($temp_gallery);
        
        update_post_meta($post_id, $gallery_meta_key, implode(',', $ordered_ids));
        
        if (!empty($ordered_ids)) {
            set_post_thumbnail($post_id, $ordered_ids[0]);
        }
        
        $remaining_queue = get_post_meta($post_id, '_sav_image_queue', true);
        if (empty($remaining_queue)) {
            wp_update_post([
                'ID' => $post_id,
                'post_status' => 'publish'
            ]);
            wp_send_json_success(['message' => "Imagen procesada. Post {$post_id} PUBLICADO (todas las imágenes completadas)."]);
        } else {
            wp_send_json_success(['message' => "Imagen procesada para post {$post_id}."]);
        }
    }

    private static function validate_vehicle_rules($vehicle, $is_cron = false) {
        $asofix_id = $vehicle['id'] ?? 'N/A';

        $first_active_stock = null;
        if (!empty($vehicle['stocks']) && is_array($vehicle['stocks'])) {
            foreach ($vehicle['stocks'] as $stock) {
                if (isset($stock['status']) && strtoupper($stock['status']) === 'ACTIVO') {
                    $first_active_stock = $stock;
                    break;
                }
            }
        }
        
        if ($first_active_stock === null) {
            return [false, 'No tiene stock activo.', null];
        }

        $price = (int)($vehicle['price']['sale_price'] ?? 0);
        if ($price < 1000) {
            return [false, "Precio inferior a 1000 (\${$price}). No se publica.", null];
        }

        $condition_filter = get_option('sincro_vehica_condition_filter', 'used');
        $car_condition = $vehicle['car_condition'] ?? 'used';
        
        if ($condition_filter === 'used' && $car_condition !== 'used') {
            return [false, "No es 'Usado' (filtro activado).", null];
        }
        if ($condition_filter === 'new' && $car_condition !== 'new') {
            return [false, "No es '0KM' (filtro activado).", null];
        }

        $blocked_locations_str = get_option('sincro_vehica_blocked_locations', '');
        if (empty($blocked_locations_str)) {
            return [true, '', $first_active_stock];
        }
        
        $blocked_words = array_map('strtolower', array_filter(array_map('trim', explode("\n", str_replace("\r", "", $blocked_locations_str)))));
        
        foreach ($vehicle['stocks'] as $stock) {
            if (isset($stock['status']) && strtoupper($stock['status']) === 'ACTIVO') {
                $branch_name = strtolower(trim($stock['branch_office_name'] ?? ''));
                $location_name = strtolower(trim($stock['location_name'] ?? ''));

                if (!empty($branch_name)) {
                    foreach ($blocked_words as $blocked_word) {
                        if (strpos($branch_name, $blocked_word) !== false) {
                            return [false, "Sucursal bloqueada (contiene '" . esc_html($blocked_word) . "').", null];
                        }
                    }
                }
                
                if (!empty($location_name)) {
                    foreach ($blocked_words as $blocked_word) {
                        if (strpos($location_name, $blocked_word) !== false) {
                            return [false, "Ubicación bloqueada (contiene '" . esc_html($blocked_word) . "').", null];
                        }
                    }
                }
            }
        }
        
        return [true, '', $first_active_stock];
    }

    private static function assign_taxonomies($post_id, $data) {
        $taxonomy_map = [
            'vehica_6659' => $data['brand_name'] ?? null,
            'vehica_6660' => $data['model_name'] ?? null,
            'vehica_6654' => (isset($data['car_condition']) && $data['car_condition'] === 'new') ? '0KM' : 'Usado',
            'vehica_6662' => $data['car_transmission'] ?? null,
            'vehica_6663' => $data['car_fuel_type'] ?? null,
            'vehica_6666' => $data['colors'][0]['name'] ?? null,
            'vehica_6655' => $data['car_segment'] ?? null,
        ];
        
        foreach ($taxonomy_map as $tax_slug => $term_name) {
            if ($term_name) {
                $term = get_term_by('name', $term_name, $tax_slug);
                $term_id = $term ? (int)$term->term_id : null;
                
                if (!$term_id) {
                    $term_data = wp_insert_term($term_name, $tax_slug);
                    if (!is_wp_error($term_data)) {
                        $term_id = (int)$term_data['term_id'];
                    }
                }
                
                if ($term_id) { 
                    wp_set_object_terms($post_id, $term_id, $tax_slug, false); 
                    update_post_meta($post_id, $tax_slug, $term_id);
                }
            }
        }
    }
    
    private static function set_meta_data($post_id, $data, $stock) {
        update_post_meta($post_id, 'asofix-id', $data["id"]);
        update_post_meta($post_id, 'vehica_29075', (string)($data["id"] ?? ''));
        update_post_meta($post_id, 'vehica_6671', (string)($data["license_plate"] ?? ''));
        
        $kilometres = (int)($data["kilometres"] ?? 0);
        if ($kilometres < 100) { $kilometres = 0; }
        update_post_meta($post_id, 'vehica_6664', (string)$kilometres);
        update_post_meta($post_id, 'vehica_14696', (string)($data["year"] ?? ''));
        
        // ========================================
        // LÓGICA DE PRECIOS v69.0 (MANUS.IM - EXACTA)
        // ========================================
        $price = (float)($data['price']['list_price'] ?? 0);
        $currency = $data['price']['currency_name'] ?? '';
        
        delete_post_meta($post_id, 'vehica_currency_6656_2316');
        delete_post_meta($post_id, 'vehica_currency_6656_2577');
        
        if (stripos($currency, 'Dolar') !== false || stripos($currency, 'USD') !== false) {
            if ($price >= 1000) { 
                update_post_meta($post_id, 'vehica_currency_6656_2577', $price); 
            }
        } else {
            if ($price > 901000) { 
                update_post_meta($post_id, 'vehica_currency_6656_2316', $price); 
            } elseif ($price >= 1000 && $price <= 900000) { 
                update_post_meta($post_id, 'vehica_currency_6656_2577', $price); 
            }
        }
        
        update_post_meta($post_id, 'vehica_featured', 0);
    }

    private static function get_existing_image_urls($post_id) {
        $gallery = get_post_meta($post_id, 'vehica_6673', true);
        if (empty($gallery)) {
            return [];
        }
        
        $gallery_ids = explode(',', $gallery);
        $urls = [];
        
        foreach ($gallery_ids as $att_id) {
            $att_id = (int)trim($att_id);
            if ($att_id > 0) {
                $url = wp_get_attachment_url($att_id);
                if ($url) {
                    $filename = basename($url);
                    $urls[] = $filename;
                }
            }
        }
        
        return $urls;
    }

    private static function delete_attached_images($post_id) {
        $attachments = get_attached_media('image', $post_id);
        foreach ($attachments as $attachment) {
            wp_delete_attachment($attachment->ID, true);
        }
        delete_post_meta($post_id, 'vehica_6673');
        delete_post_meta($post_id, '_thumbnail_id');
        delete_post_meta($post_id, '_temp_gallery_order');
    }
    
    private static function sideload_image_with_curl($image_url, $post_id) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        
        $subfolder_range = 100;
        $subfolder_number = floor($post_id / $subfolder_range);
        
        add_filter('upload_dir', function($upload) use ($subfolder_number) {
            $custom_subdir = '/vehiculos/' . $subfolder_number;
            
            $upload['path'] = $upload['basedir'] . $custom_subdir;
            $upload['url'] = $upload['baseurl'] . $custom_subdir;
            $upload['subdir'] = $custom_subdir;
            
            if (!file_exists($upload['path'])) {
                wp_mkdir_p($upload['path']);
            }
            
            return $upload;
        });
        
        $tmp_file = wp_tempnam($image_url);
        if (!$tmp_file) { 
            remove_all_filters('upload_dir');
            return new WP_Error('temp_file_error', 'No se pudo crear el archivo temporal.'); 
        }
        
        $ch = curl_init($image_url);
        $fp = fopen($tmp_file, 'wb');
        
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 300);
        curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        
        curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        fclose($fp);
        
        if ($http_code !== 200) {
            @unlink($tmp_file);
            remove_all_filters('upload_dir');
            return new WP_Error('curl_download_error', "Falló la descarga cURL (Código: {$http_code})");
        }
        
        preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $image_url, $matches);
        $file_array = [
            'name' => $matches ? basename($matches[0]) : 'asofix-image.jpg',
            'tmp_name' => $tmp_file
        ];
        
        $attachment_id = media_handle_sideload($file_array, $post_id, null);
        
        if (is_wp_error($attachment_id)) { 
            @unlink($file_array['tmp_name']);
            remove_all_filters('upload_dir');
            return $attachment_id; 
        }
        
        remove_all_filters('upload_dir');
        
        return $attachment_id;
    }

    public static function ajax_cleanup_phase() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        self::cleanup_phase_cron();
        wp_send_json_success(['message' => 'Fase de limpieza completada.']);
    }
    
    public static function ajax_clear_log_file() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        if (defined('SAV_LOG_FILE') && file_exists(SAV_LOG_FILE)) {
            if (file_put_contents(SAV_LOG_FILE, '') !== false) {
                SAV_Log::info('[ADMIN] Log limpiado manualmente');
                wp_send_json_success(['message' => 'Archivo de log limpiado.']);
            } else {
                wp_send_json_error(['message' => 'No se pudo limpiar el archivo de log (revisa permisos).']);
            }
        } else {
            wp_send_json_success(['message' => 'El archivo de log no existía.']);
        }
    }
    
    public static function ajax_reset_timestamps() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        global $wpdb;
        $table_name = $wpdb->prefix . 'sav_sync_dates';
        $wpdb->query("TRUNCATE TABLE $table_name");
        
        SAV_Log::info('[ADMIN] Timestamps reseteados manualmente');
        wp_send_json_success(['message' => 'Timestamps reseteados. Próxima sincronización será completa.']);
    }
    
    public static function ajax_get_server_log() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { 
            wp_send_json_error(['message' => 'Permiso denegado.']); 
        }
        
        if (defined('SAV_LOG_FILE') && file_exists(SAV_LOG_FILE)) {
            $log_content = file_get_contents(SAV_LOG_FILE);
            wp_send_json_success(['log' => $log_content]);
        } else {
            wp_send_json_error(['message' => 'Archivo de log no encontrado.']);
        }
    }
}
?>