<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SAV_Sync {
    public static function init() {
        // Handlers para las fases manuales
        add_action('wp_ajax_sav_get_page', [__CLASS__, 'ajax_get_page']);
        add_action('wp_ajax_sav_process_vehicle', [__CLASS__, 'ajax_process_vehicle']);
        add_action('wp_ajax_sav_find_pending_images', [__CLASS__, 'ajax_find_pending_images']);
        add_action('wp_ajax_sav_process_single_image', [__CLASS__, 'ajax_process_single_image']);
        
        // Handler para el visor de log
        add_action('wp_ajax_sav_get_server_log', [__CLASS__, 'ajax_get_server_log']);
        
        // Hook para el CRON
        add_action('sav_cron_hook', [__CLASS__, 'run_cron']);
    }

    public static function activate_cron() { if (!wp_next_scheduled('sav_cron_hook')) { wp_schedule_event(time(), 'hourly', 'sav_cron_hook'); } }
    public static function deactivate_cron() { wp_clear_scheduled_hook('sav_cron_hook'); }
    public static function run_cron() { /* Lógica del CRON */ }

    public static function ajax_get_page() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce')) wp_send_json_error(['message' => 'Permiso denegado']);
        $api = new SAV_Api();
        $result = $api->get_vehicles_page(isset($_POST['page']) ? (int)$_POST['page'] : 1);
        is_wp_error($result) ? wp_send_json_error(['message' => $result->get_error_message()]) : wp_send_json_success($result);
    }

    public static function ajax_process_vehicle() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce')) wp_send_json_error(['message' => 'Permiso denegado']);
        $data = json_decode(stripslashes($_POST['vehicle_data']), true);
        if (empty($data['id'])) { wp_send_json_error(['message' => 'ID de vehículo no válido']); return; }

        $post_id = self::find_post_by_asofix_id($data['id']);
        
        if ($post_id) {
            $api_updated_at = isset($data['updated_at']) ? strtotime($data['updated_at']) : 0;
            $local_updated_at = (int) get_post_meta($post_id, '_sav_last_update', true);

            if ($api_updated_at > $local_updated_at) {
                $result = self::update_post($post_id, $data);
                is_wp_error($result) ? wp_send_json_error(['message' => "Error al actualizar: " . $result->get_error_message()]) : wp_send_json_success(['message' => "Post {$post_id} ACTUALIZADO."]);
            } else {
                // ==================================================
                // CORRECCIÓN CRÍTICA: Limpiar la cola si el post no ha cambiado.
                // ==================================================
                delete_post_meta($post_id, '_sav_image_queue');
                wp_send_json_success(['message' => "Post {$post_id} OMITIDO (sin cambios)."]);
            }
        } else {
            $result = self::create_post($data);
            is_wp_error($result) ? wp_send_json_error(['message' => 'Error al crear: ' . $result->get_error_message()]) : wp_send_json_success(['message' => "Post {$result} CREADO."]);
        }
    }
    
    // ... (El resto de las funciones ajax_*, find_post_by_asofix_id, create_post, update_post, etc. son correctas y no necesitan cambios)
    // ... (Las incluyo por completitud)

    public static function ajax_find_pending_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce')) wp_send_json_error(['message' => 'Permiso denegado']);
        wp_send_json_success(['image_jobs' => self::find_pending_images()]);
    }

    public static function ajax_process_single_image() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce')) wp_send_json_error(['message' => 'Permiso denegado']);
        $job = json_decode(stripslashes($_POST['job']), true);
        if (empty($job)) { wp_send_json_error(['message' => 'Datos de imagen inválidos.']); return; }
        $result = self::process_single_image($job);
        is_wp_error($result) ? wp_send_json_error(['message' => $result->get_error_message()]) : wp_send_json_success(['message' => $result]);
    }

    public static function ajax_get_server_log() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sav_nonce')) wp_send_json_error(['message' => 'Permiso denegado']);
        $log_content = file_exists(SAV_LOG_FILE) ? file_get_contents(SAV_LOG_FILE) : 'Archivo de log no encontrado.';
        wp_send_json_success(['log' => nl2br(esc_html($log_content))]);
    }

    private static function find_post_by_asofix_id($asofix_id) {
        global $wpdb;
        $post_id = $wpdb->get_var($wpdb->prepare("SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_asofix_id' AND meta_value = %s LIMIT 1", (string) $asofix_id));
        return $post_id ? (int)$post_id : null;
    }

    private static function create_post($data) {
        $image_urls = (!empty($data['images']) && is_array($data['images'])) ? array_column($data['images'], 'url') : [];
        $has_images = !empty($image_urls);

        $post_data = ['post_title' => wp_strip_all_tags(($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '')), 'post_status' => $has_images ? 'draft' : 'publish', 'post_type' => 'vehica_car', 'post_content' => sanitize_textarea_field($data['description'] ?? '')];
        $post_id = wp_insert_post($post_data, true);

        if (is_wp_error($post_id)) return $post_id;

        update_post_meta($post_id, '_asofix_id', (string) $data['id']);
        self::update_meta_data($post_id, $data);
        if ($has_images) update_post_meta($post_id, '_sav_image_queue', $image_urls);
        update_post_meta($post_id, '_sav_last_update', isset($data['updated_at']) ? strtotime($data['updated_at']) : time());
        return $post_id;
    }

    private static function update_post($post_id, $data) {
        $image_urls = (!empty($data['images']) && is_array($data['images'])) ? array_column($data['images'], 'url') : [];
        $has_images = !empty($image_urls);
        $new_status = $has_images ? 'draft' : 'publish';

        $post_data = ['ID' => $post_id, 'post_title' => wp_strip_all_tags(($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '')), 'post_status' => $new_status, 'post_content' => sanitize_textarea_field($data['description'] ?? '')];
        $result = wp_update_post($post_data, true);

        if (is_wp_error($result)) return $result;

        self::update_meta_data($post_id, $data);
        if ($has_images) {
            update_post_meta($post_id, '_sav_image_queue', $image_urls);
        } else {
            delete_post_meta($post_id, '_sav_image_queue');
        }
        update_post_meta($post_id, '_sav_last_update', isset($data['updated_at']) ? strtotime($data['updated_at']) : time());
        return $post_id;
    }

    private static function update_meta_data($post_id, $data) {
        $price = (int)($data['price']['sale_price'] ?? 0);
        delete_post_meta($post_id, 'vehica_currency_6656_2316');
        delete_post_meta($post_id, 'vehica_currency_6656_2577');
        delete_post_meta($post_id, 'vehica_price_type_6656');
        if ($price > 0) {
            if ($price < 900000) {
                if ($price >= 1000) { update_post_meta($post_id, 'vehica_currency_6656_2577', $price); update_post_meta($post_id, 'vehica_price_type_6656', 2577); }
            } else { update_post_meta($post_id, 'vehica_currency_6656_2316', $price); update_post_meta($post_id, 'vehica_price_type_6656', 2316); }
        }
    }

    private static function find_pending_images() {
        global $wpdb;
        $results = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue'");
        $jobs = [];
        foreach ($results as $result) {
            $images = maybe_unserialize($result->meta_value);
            if (is_array($images) && !empty($images)) {
                foreach ($images as $order => $url) {
                    if (!empty($url)) $jobs[] = ['post_id' => $result->post_id, 'image_url' => $url, 'image_order' => $order];
                }
            }
        }
        return $jobs;
    }

    private static function process_single_image($job) {
        $post_id = (int)$job['post_id'];
        $image_url = esc_url_raw($job['image_url']);
        $image_order = (int)$job['image_order'];

        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $tmp = download_url($image_url, 300);
        if (is_wp_error($tmp)) return new WP_Error('download_failed', $tmp->get_error_message());

        preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $image_url, $matches);
        $file_array = ['name' => $matches ? basename($matches[0]) : 'sav-image.jpg', 'tmp_name' => $tmp];
        $attachment_id = media_handle_sideload($file_array, $post_id, null);

        if (is_wp_error($attachment_id)) { @unlink($file_array['tmp_name']); return new WP_Error('sideload_failed', $attachment_id->get_error_message()); }

        $temp_gallery = get_post_meta($post_id, '_sav_temp_gallery', true) ?: [];
        $temp_gallery[$image_order] = $attachment_id;
        update_post_meta($post_id, '_sav_temp_gallery', $temp_gallery);

        $queue = get_post_meta($post_id, '_sav_image_queue', true) ?: [];
        if (($key = array_search($image_url, $queue)) !== false) unset($queue[$key]);
        $queue = array_values($queue);

        if (empty($queue)) {
            delete_post_meta($post_id, '_sav_image_queue');
            $gallery = get_post_meta($post_id, '_sav_temp_gallery', true);
            if (is_array($gallery)) {
                ksort($gallery);
                $final_ids = array_values($gallery);
                update_post_meta($post_id, 'vehica_6673', implode(',', $final_ids));
                if (!empty($final_ids)) set_post_thumbnail($post_id, $final_ids[0]);
                delete_post_meta($post_id, '_sav_temp_gallery');
            }
            wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
            return "Post {$post_id} PUBLICADO.";
        } else {
            update_post_meta($post_id, '_sav_image_queue', $queue);
            return "Imagen para Post {$post_id} procesada.";
        }
    }
}