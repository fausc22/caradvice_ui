<?php
// class-sincro-vehica-sync.php - v104.0 ("Bloqueo Reforzado")
if ( ! defined( 'ABSPATH' ) ) exit;

class Sincro_Vehica_Sync {

    // ===================================================================
    // ===      FUNCIONES PARA CRON (EJECUCIÓN AUTOMÁTICA)             ===
    // ===================================================================

    public static function run_full_sync_cron() {
        if (get_option('sincro_vehica_cron_enabled', 'on') !== 'on') {
            SAV_Log::info("[CRON] Sincronización automática desactivada. No se ejecuta.");
            return;
        }

        SAV_Log::info("[CRON] INICIO de sincronización automática.");

        // --- FASE 1: DATOS ---
        SAV_Log::info("[CRON] Iniciando Fase 1: Datos.");
        $api = new Sincro_Vehica_Api();
        $page = 1;
        $max_pages_cron = 1000;
        $processed_vehicles = 0;

        while ($page <= $max_pages_cron) {
            $response = $api->get_vehicles_page($page);

            if (is_wp_error($response)) {
                SAV_Log::info("[CRON] ERROR en API en página {$page}: " . $response->get_error_message());
                break;
            }
            if (empty($response['vehicles'])) {
                SAV_Log::info("[CRON] No hay más vehículos en la página {$page}.");
                break;
            }

            foreach ($response['vehicles'] as $vehicle) {
                self::process_single_vehicle_cron($vehicle);
                $processed_vehicles++;
            }

            if (empty($response['pagination']) || $response['pagination']['current_page'] >= $response['pagination']['last_page']) {
                break;
            }
            $page++;
        }
        SAV_Log::info("[CRON] Fase 1 (Datos) completada. {$processed_vehicles} vehículos de la API revisados.");

        // --- FASE 2: IMÁGENES ---
        SAV_Log::info("[CRON] Iniciando Fase 2: Imágenes.");
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare("SELECT post_id, meta_value FROM $wpdb->postmeta WHERE meta_key = %s", '_sav_image_queue'));
        $image_count = 0;
        foreach ($results as $result) {
            $image_urls = maybe_unserialize($result->meta_value);
            if (!empty($image_urls) && is_array($image_urls)) {
                self::delete_attached_images($result->post_id);
                $gallery_ids = [];
                foreach ($image_urls as $url) {
                    $attachment_id = self::sideload_image_with_curl($url, $result->post_id);
                    if (!is_wp_error($attachment_id)) {
                        $gallery_ids[] = $attachment_id;
                        $image_count++;
                    } else {
                        SAV_Log::info("[CRON] Error al descargar imagen {$url} para Post ID {$result->post_id}: " . $attachment_id->get_error_message());
                    }
                }
                if (!empty($gallery_ids)) {
                    update_post_meta($result->post_id, 'vehica_6673', implode(',', $gallery_ids));
                    set_post_thumbnail($result->post_id, $gallery_ids[0]);
                }
            }
            delete_post_meta($result->post_id, '_sav_image_queue');
        }
        SAV_Log::info("[CRON] Fase 2 (Imágenes) completada. {$image_count} imágenes procesadas.");

        // --- FASE 3: LIMPIEZA ---
        SAV_Log::info("[CRON] Iniciando Fase 3: Limpieza (desactivación de vehículos no encontrados).");
        self::cleanup_phase_cron();
        
        SAV_Log::info("[CRON] FIN de sincronización automática.");
    }

    private static function process_single_vehicle_cron($vehicle) {
        $asofix_id = $vehicle['id'] ?? null;
        if (!$asofix_id) { return; }
        $active_stock = null;
        if (!empty($vehicle['stocks']) && is_array($vehicle['stocks'])) {
            foreach ($vehicle['stocks'] as $stock) {
                if (isset($stock['status']) && strtoupper($stock['status']) === 'ACTIVO') { $active_stock = $stock; break; }
            }
        }
        if ($active_stock === null) { return; }

        $blocked_locations_str = get_option('sincro_vehica_blocked_locations', '');
        if (!empty($blocked_locations_str)) {
            $blocked_locations = array_filter(array_map('trim', array_map('strtolower', explode("\n", $blocked_locations_str))));
            $branch_name = strtolower(trim($active_stock['branch_office_name'] ?? ''));
            if (!empty($branch_name) && in_array($branch_name, $blocked_locations)) {
                SAV_Log::info("[CRON] OMITIDO: Vehículo {$asofix_id} en ubicación bloqueada ('{$active_stock['branch_office_name']}').");
                return;
            }
        }

        global $wpdb;
        $existing_post_id = $wpdb->get_var($wpdb->prepare("SELECT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id WHERE p.post_type = 'vehica_car' AND p.post_status = 'publish' AND pm.meta_key = %s AND pm.meta_value = %s", '_sav_asofix_guid', $asofix_id));
        $dates_table = $wpdb->prefix . 'sav_sync_dates';
        if ($existing_post_id) {
            $wpdb->flush();
            $last_update_timestamp = (int)$wpdb->get_var($wpdb->prepare("SELECT last_update_ts FROM $dates_table WHERE post_id = %d", $existing_post_id));
            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
            if ($current_update_timestamp > 0 && $last_update_timestamp > 0 && $current_update_timestamp <= $last_update_timestamp) {
                return;
            }
            $post_id = $existing_post_id;
            $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
            wp_update_post(['ID' => $post_id, 'post_title' => $post_title, 'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')]);
            self::assign_taxonomies($post_id, $vehicle);
            self::set_meta_data($post_id, $vehicle, $active_stock);
            $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
            $image_urls = array_column($vehicle['images'] ?? [], 'url');
            if (!empty($image_urls)) { update_post_meta($post_id, '_sav_image_queue', $image_urls); }
            SAV_Log::info("[CRON] Post {$post_id} ACTUALIZADO.");
        } else {
            $post_id = wp_insert_post(['post_type' => 'vehica_car', 'post_status' => 'publish', 'post_title' => ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? ''), 'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')]);
            if (is_wp_error($post_id)) { SAV_Log::info("[CRON] Error al crear post: " . $post_id->get_error_message()); return; }
            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
            self::assign_taxonomies($post_id, $vehicle);
            self::set_meta_data($post_id, $vehicle, $active_stock);
            $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
            $image_urls = array_column($vehicle['images'] ?? [], 'url');
            if (!empty($image_urls)) { update_post_meta($post_id, '_sav_image_queue', $image_urls); }
            SAV_Log::info("[CRON] Post {$post_id} CREADO para Asofix ID {$asofix_id}.");
        }
    }

    private static function cleanup_phase_cron() {
        $api = new Sincro_Vehica_Api();
        $all_api_ids = [];
        $current_page = 1;
        $max_pages = 1000;
        while ($current_page <= $max_pages) {
            $response = $api->get_vehicles_page($current_page);
            if (is_wp_error($response) || empty($response['vehicles'])) { break; }
            foreach ($response['vehicles'] as $vehicle) { if (!empty($vehicle['id'])) { $all_api_ids[] = $vehicle['id']; } }
            if (empty($response['pagination']) || $response['pagination']['current_page'] >= $response['pagination']['last_page']) { break; }
            $current_page++;
        }
        if (empty($all_api_ids)) { SAV_Log::info("[CRON] No se pudo obtener lista de IDs de la API para limpieza. Abortando."); return; }
        global $wpdb;
        $website_vehicle_ids = $wpdb->get_results($wpdb->prepare("SELECT p.ID, pm.meta_value AS asofix_id FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id WHERE p.post_type = %s AND p.post_status = %s AND pm.meta_key = %s", 'vehica_car', 'publish', '_sav_asofix_guid'));
        $deactivated_count = 0;
        foreach ($website_vehicle_ids as $vehicle) {
            if (!in_array($vehicle->asofix_id, $all_api_ids)) {
                wp_update_post(['ID' => $vehicle->ID, 'post_status' => 'draft']);
                $deactivated_count++;
            }
        }
        SAV_Log::info("[CRON] Fase 3 (Limpieza) completada. {$deactivated_count} vehículos pasados a borrador.");
    }

    // ===================================================================
    // ===      FUNCIONES AJAX (EJECUCIÓN MANUAL)                      ===
    // ===================================================================
    
    public static function ajax_start_phase_1() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        global $wpdb;
        $wpdb->delete($wpdb->postmeta, ['meta_key' => '_sav_image_queue']);
        wp_send_json_success(['message' => 'Cola de imágenes reseteada.']);
    }

    public static function ajax_get_page() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $api = new Sincro_Vehica_Api();
        $result = $api->get_vehicles_page($page);
        if (is_wp_error($result)) { wp_send_json_error(['message' => $result->get_error_message()]); } 
        else { wp_send_json_success($result); }
    }

    public static function ajax_process_post_no_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        
        $vehicle = json_decode(stripslashes($_POST['vehicle_data']), true);
        $asofix_id = $vehicle['id'] ?? null;
        if (!$asofix_id) { wp_send_json_success(['message' => 'OMITIDO: Vehículo sin Asofix ID principal.']); return; }
        
        $active_stock = null;
        if (!empty($vehicle['stocks']) && is_array($vehicle['stocks'])) {
            foreach ($vehicle['stocks'] as $stock) {
                if (isset($stock['status']) && strtoupper($stock['status']) === 'ACTIVO') { $active_stock = $stock; break; }
            }
        }
        if ($active_stock === null) { wp_send_json_success(['message' => "OMITIDO: Vehículo {$asofix_id} no tiene stock activo."]); return; }
        
        $blocked_locations_str = get_option('sincro_vehica_blocked_locations', '');
        if (!empty($blocked_locations_str)) {
            $blocked_locations = array_filter(array_map('trim', array_map('strtolower', explode("\n", $blocked_locations_str))));
            $branch_name = strtolower(trim($active_stock['branch_office_name'] ?? ''));
            if (!empty($branch_name) && in_array($branch_name, $blocked_locations)) { 
                wp_send_json_success(['message' => "OMITIDO: Vehículo {$asofix_id} en ubicación bloqueada ('{$active_stock['branch_office_name']}')."]); 
                return; 
            }
        }
        
        global $wpdb;
        $existing_post_id = $wpdb->get_var($wpdb->prepare("SELECT p.ID FROM {$wpdb->posts} p JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id WHERE p.post_type = 'vehica_car' AND p.post_status = 'publish' AND pm.meta_key = %s AND pm.meta_value = %s", '_sav_asofix_guid', $asofix_id));
        $dates_table = $wpdb->prefix . 'sav_sync_dates';

        if ($existing_post_id) {
            $wpdb->flush();
            $last_update_timestamp = (int)$wpdb->get_var($wpdb->prepare("SELECT last_update_ts FROM $dates_table WHERE post_id = %d", $existing_post_id));
            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;

            if ($current_update_timestamp > 0 && $last_update_timestamp > 0 && $current_update_timestamp <= $last_update_timestamp) {
                wp_send_json_success(['message' => "SIN CAMBIOS: Vehículo {$asofix_id} (timestamp no es nuevo)."]);
                return;
            }

            $post_id = $existing_post_id;
            self::delete_attached_images($post_id);
            $post_title = ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? '');
            wp_update_post(['ID' => $post_id, 'post_title' => $post_title, 'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')]);
            
            self::assign_taxonomies($post_id, $vehicle);
            self::set_meta_data($post_id, $vehicle, $active_stock);
            $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
            $image_urls = array_column($vehicle['images'] ?? [], 'url');
            if (!empty($image_urls)) { update_post_meta($post_id, '_sav_image_queue', $image_urls); }
            wp_send_json_success(['message' => "Post {$post_id} ACTUALIZADO (timestamp nuevo)."]);
        } else {
            $post_id = wp_insert_post(['post_type' => 'vehica_car', 'post_status' => 'publish', 'post_title' => ($vehicle["brand_name"] ?? '') . ' ' . ($vehicle["model_name"] ?? '') . ' ' . ($vehicle["version"] ?? ''), 'post_content' => sanitize_textarea_field($vehicle['description'] ?? '')]);
            if (is_wp_error($post_id)) { wp_send_json_error(['message' => $post_id->get_error_message()]); return; }

            $current_update_timestamp = isset($vehicle['updated_at']) ? strtotime($vehicle['updated_at']) : 0;
            $current_update_timestamp = $current_update_timestamp === false ? 0 : $current_update_timestamp;
            self::assign_taxonomies($post_id, $vehicle);
            self::set_meta_data($post_id, $vehicle, $active_stock);
            $wpdb->replace($dates_table, ['post_id' => $post_id, 'last_update_ts' => $current_update_timestamp]);
            $image_urls = array_column($vehicle['images'] ?? [], 'url');
            if (!empty($image_urls)) { update_post_meta($post_id, '_sav_image_queue', $image_urls); }
            wp_send_json_success(['message' => "Post {$post_id} CREADO para Asofix ID {$asofix_id}."]);
        }
    }

    private static function assign_taxonomies($post_id, $data) {
        $taxonomy_map = [
            'vehica_6659' => $data['brand_name'] ?? null, 'vehica_6660' => $data['model_name'] ?? null,
            'vehica_6654' => (isset($data['car_condition']) && $data['car_condition'] === 'new') ? '0KM' : 'Usado',
            'vehica_6662' => $data['car_transmission'] ?? null, 'vehica_6663' => $data['car_fuel_type'] ?? null,
            'vehica_6666' => $data['colors'][0]['name'] ?? null, 'vehica_6655' => $data['car_segment'] ?? null,
        ];
        foreach ($taxonomy_map as $tax_slug => $term_name) {
            if ($term_name) {
                $term = get_term_by('name', $term_name, $tax_slug);
                $term_id = $term ? (int)$term->term_id : null;
                if (!$term_id) {
                    $term_data = wp_insert_term($term_name, $tax_slug);
                    if (!is_wp_error($term_data)) $term_id = (int)$term_data['term_id'];
                }
                if ($term_id) { 
                    wp_set_object_terms($post_id, $term_id, $tax_slug, false); 
                    update_post_meta($post_id, $tax_slug, $term_id);
                }
            }
        }
    }
    private static function set_meta_data($post_id, $data, $stock) {
        update_post_meta($post_id, '_sav_asofix_guid', $data["id"] ?? '');
        update_post_meta($post_id, 'asofix-id', (string)($stock["vin"] ?? ''));
        update_post_meta($post_id, 'vehica_6671', (string)($data["license_plate"] ?? ''));
        $kilometres = (int)($data["kilometres"] ?? 0);
        if ($kilometres < 100) { $kilometres = 0; }
        update_post_meta($post_id, 'vehica_6664', (string)$kilometres);
        update_post_meta($post_id, 'vehica_14696', (string)($data["year"] ?? ''));
        $price = (float)($data['price']['list_price'] ?? 0);
        $currency = $data['price']['currency_name'] ?? '';
        delete_post_meta($post_id, 'vehica_currency_6656_2316');
        delete_post_meta($post_id, 'vehica_currency_6656_2577');
        if (stripos($currency, 'Dolar') !== false || stripos($currency, 'USD') !== false) {
            if ($price >= 1000) { update_post_meta($post_id, 'vehica_currency_6656_2577', $price); }
        } else {
            if ($price > 901000) { update_post_meta($post_id, 'vehica_currency_6656_2316', $price); }
            elseif ($price >= 1000 && $price <= 900000) { update_post_meta($post_id, 'vehica_currency_6656_2577', $price); }
        }
    }
    private static function delete_attached_images($post_id) {
        $attachments = get_attached_media('image', $post_id);
        foreach ($attachments as $attachment) {
            wp_delete_attachment($attachment->ID, true);
        }
        delete_post_meta($post_id, 'vehica_6673');
        delete_post_meta($post_id, '_thumbnail_id');
    }
    public static function ajax_find_pending_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        global $wpdb;
        $results = $wpdb->get_results($wpdb->prepare("SELECT post_id, meta_value FROM $wpdb->postmeta WHERE meta_key = %s", '_sav_image_queue'));
        $image_jobs = [];
        foreach ($results as $result) {
            $image_urls = maybe_unserialize($result->meta_value);
            if (!empty($image_urls) && is_array($image_urls)) {
                foreach ($image_urls as $url) { $image_jobs[] = ['post_id' => $result->post_id, 'image_url' => $url]; }
            }
        }
        wp_send_json_success(['image_jobs' => $image_jobs]);
    }
    public static function ajax_process_single_image() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        $post_id = isset($_POST['post_id']) ? (int)$_POST['post_id'] : 0;
        $image_url = isset($_POST['image_url']) ? esc_url_raw($_POST['image_url']) : '';
        if (!$post_id || !$image_url) { wp_send_json_error(['message' => 'Faltan parámetros.']); }
        $attachment_id = self::sideload_image_with_curl($image_url, $post_id);
        if (is_wp_error($attachment_id)) {
            wp_send_json_error(['message' => 'Error al procesar imagen: ' . $attachment_id->get_error_message()]);
            return;
        }
        $gallery_meta_key = 'vehica_6673';
        $gallery_ids_str = get_post_meta($post_id, $gallery_meta_key, true);
        $gallery_ids = !empty($gallery_ids_str) ? explode(',', $gallery_ids_str) : [];
        $gallery_ids[] = $attachment_id;
        update_post_meta($post_id, $gallery_meta_key, implode(',', array_unique($gallery_ids)));
        if (count($gallery_ids) === 1) { set_post_thumbnail($post_id, $attachment_id); }
        wp_send_json_success(['message' => "Imagen para post {$post_id} procesada con éxito."]);
    }
    private static function sideload_image_with_curl($image_url, $post_id) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $tmp_file = wp_tempnam($image_url);
        if (!$tmp_file) { return new WP_Error('temp_file_error', 'No se pudo crear el archivo temporal.'); }
        $ch = curl_init($image_url);
        $fp = fopen($tmp_file, 'wb');
        curl_setopt($ch, CURLOPT_FILE, $fp);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 300);
        curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE );
        curl_close($ch);
        fclose($fp);
        if ($http_code !== 200 ) {
            @unlink($tmp_file);
            return new WP_Error('curl_download_error', "Falló la descarga cURL (Código: {$http_code} )");
        }
        preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $image_url, $matches);
        $file_array = ['name' => $matches ? basename($matches[0]) : 'asofix-image.jpg', 'tmp_name' => $tmp_file];
        $attachment_id = media_handle_sideload($file_array, $post_id, null);
        if (is_wp_error($attachment_id)) { @unlink($tmp_file); return $attachment_id; }
        return $attachment_id;
    }
    public static function ajax_cleanup_phase() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        self::cleanup_phase_cron();
        wp_send_json_success(['message' => 'Fase de limpieza completada.']);
    }
    public static function ajax_clear_log_file() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        if (file_exists(SAV_LOG_FILE)) {
            if (unlink(SAV_LOG_FILE)) {
                wp_send_json_success(['message' => 'Archivo de log limpiado.']);
            } else {
                wp_send_json_error(['message' => 'No se pudo limpiar el archivo de log (error de permisos).']);
            }
        } else {
            wp_send_json_success(['message' => 'El archivo de log no existía.']);
        }
    }
    public static function ajax_reset_timestamps() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) { wp_send_json_error(['message' => 'Permiso denegado.']); }
        global $wpdb;
        $table_name = $wpdb->prefix . 'sav_sync_dates';
        $wpdb->query("TRUNCATE TABLE $table_name");
        wp_send_json_success(['message' => 'Timestamps reseteados.']);
    }
}
?>