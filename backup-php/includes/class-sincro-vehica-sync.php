<?php
// class-sincro-vehica-sync.php (v145.16 - Motor Seguro por Pasos)
if ( ! defined( 'ABSPATH' ) ) exit;

class Sincro_Vehica_Sync {

    // --- AJAX Handlers para la Interfaz Manual ---

    public static function ajax_get_page() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        $page = isset($_POST['page']) ? (int)$_POST['page'] : 1;
        $api = new Sincro_Vehica_Api(); // Asume que tienes class-sincro-vehica-api.php
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
        
        $vehicle_data = json_decode(stripslashes($_POST['vehicle_data']), true);
        if (empty($vehicle_data['id'])) {
            wp_send_json_error(['message' => 'Datos de vehículo inválidos.']);
            return;
        }

        // Lógica de creación/actualización
        $post_id = self::find_post_by_asofix_id($vehicle_data['id']);
        if ($post_id) {
            self::update_post($post_id, $vehicle_data);
            wp_send_json_success(['message' => "Post {$post_id} ACTUALIZADO."]);
        } else {
            $new_post_id = self::create_post($vehicle_data);
            wp_send_json_success(['message' => "Post {$new_post_id} CREADO."]);
        }
    }

    public static function ajax_find_pending_images() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        global $wpdb;
        $results = $wpdb->get_results("SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue'");
        $image_jobs = [];
        foreach ($results as $result) {
            $images = maybe_unserialize($result->meta_value);
            if (is_array($images)) {
                foreach ($images as $order => $url) {
                    $image_jobs[] = ['post_id' => $result->post_id, 'image_url' => $url, 'image_order' => $order];
                }
            }
        }
        wp_send_json_success(['image_jobs' => $image_jobs]);
    }

    public static function ajax_process_single_image() {
        if (!current_user_can('manage_options') || !check_ajax_referer('sincro_vehica_nonce', '_ajax_nonce', false)) {
            wp_send_json_error(['message' => 'Permiso denegado.']);
        }
        
        $post_id = (int)$_POST['post_id'];
        $image_url = esc_url_raw($_POST['image_url']);
        $image_order = (int)$_POST['image_order'];

        $attachment_id = self::sideload_image($image_url, $post_id);

        if (is_wp_error($attachment_id)) {
            wp_send_json_error(['message' => "Error al descargar imagen para Post {$post_id}: " . $attachment_id->get_error_message()]);
            return;
        }

        // Añadir a galería temporal
        $temp_gallery = get_post_meta($post_id, '_sav_temp_gallery', true) ?: [];
        $temp_gallery[$image_order] = $attachment_id;
        update_post_meta($post_id, '_sav_temp_gallery', $temp_gallery);

        // Eliminar de la cola
        $queue = get_post_meta($post_id, '_sav_image_queue', true) ?: [];
        if (($key = array_search($image_url, $queue)) !== false) {
            unset($queue[$key]);
        }

        if (empty($queue)) {
            // Si la cola está vacía, finalizamos y publicamos
            delete_post_meta($post_id, '_sav_image_queue');
            self::finalize_gallery($post_id);
            wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
            wp_send_json_success(['message' => "Post {$post_id} PUBLICADO (imágenes completadas)."]);
        } else {
            // Si no, solo actualizamos la cola
            update_post_meta($post_id, '_sav_image_queue', $queue);
            wp_send_json_success(['message' => "Imagen {$image_order} para Post {$post_id} procesada."]);
        }
    }

    // --- Lógica de Base de Datos (El Motor) ---

    private static function find_post_by_asofix_id($asofix_id) {
        global $wpdb;
        return $wpdb->get_var($wpdb->prepare("SELECT post_id FROM $wpdb->postmeta WHERE meta_key = '_asofix_id' AND meta_value = %s", $asofix_id));
    }

    private static function create_post($data) {
        $has_images = !empty($data['images']);
        $post_id = wp_insert_post([
            'post_title'   => wp_strip_all_tags(($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '')),
            'post_status'  => $has_images ? 'draft' : 'publish',
            'post_type'    => 'car',
            'post_content' => ''
        ]);
        if ($post_id && !is_wp_error($post_id)) {
            update_post_meta($post_id, '_asofix_id', $data['id']);
            self::update_meta_data($post_id, $data);
            if ($has_images) self::queue_images($post_id, $data['images']);
        }
        return $post_id;
    }

    private static function update_post($post_id, $data) {
        $has_images = !empty($data['images']);
        wp_update_post([
            'ID'           => $post_id,
            'post_title'   => wp_strip_all_tags(($data['brand_name'] ?? '') . ' ' . ($data['model_name'] ?? '')),
            'post_status'  => $has_images ? 'draft' : 'publish',
            'post_type'    => 'car'
        ]);
        self::update_meta_data($post_id, $data);
        if ($has_images) self::queue_images($post_id, $data['images']);
    }

    private static function update_meta_data($post_id, $data) {
        // Lógica de precios
        $price = (int)($data['price']['sale_price'] ?? 0);
        delete_post_meta($post_id, 'vehica_currency_6656_2316');
        delete_post_meta($post_id, 'vehica_currency_6656_2577');
        delete_post_meta($post_id, 'vehica_price_type_6656');
        if ($price > 0) {
            if ($price < 900000) {
                if ($price >= 1000) { update_post_meta($post_id, 'vehica_currency_6656_2577', $price); update_post_meta($post_id, 'vehica_price_type_6656', 2577); }
            } else { update_post_meta($post_id, 'vehica_currency_6656_2316', $price); update_post_meta($post_id, 'vehica_price_type_6656', 2316); }
        }
        // Aquí se añadirían otras metas y taxonomías
    }

    private static function queue_images($post_id, $images) {
        $urls = array_column($images, 'url');
        update_post_meta($post_id, '_sav_image_queue', $urls);
        delete_post_meta($post_id, '_sav_temp_gallery'); // Limpiar galería temporal anterior
    }

    private static function finalize_gallery($post_id) {
        $gallery = get_post_meta($post_id, '_sav_temp_gallery', true);
        if (is_array($gallery)) {
            ksort($gallery);
            $final_ids = array_values($gallery);
            update_post_meta($post_id, 'vehica_6673', implode(',', $final_ids)); // Usa tu meta_key de galería real
            if (!empty($final_ids)) {
                set_post_thumbnail($post_id, $final_ids[0]);
            }
            delete_post_meta($post_id, '_sav_temp_gallery');
        }
    }

    private static function sideload_image($url, $post_id) {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');
        $tmp = download_url($url, 300);
        if (is_wp_error($tmp)) return $tmp;        
        preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $url, $matches);
        $file_array = ['name' => $matches ? basename($matches[0]) : 'asofix-image.jpg', 'tmp_name' => $tmp];
        
        $id = media_handle_sideload($file_array, $post_id, null);
        
        if (is_wp_error($id)) {
            @unlink($file_array['tmp_name']);
        }
        
        return $id;
    }

    // --- LÓGICA DE CRON (Automático y seguro) ---
    // Esta sección se puede añadir si se quiere que el CRON también funcione
    // de forma automática y segura en segundo plano, usando la misma lógica
    // que los botones manuales pero de forma más lenta.

    public static function run_full_sync_cron() {
        if (get_option('sincro_vehica_cron_enabled', 'on') !== 'on') { 
            return; 
        }
        
        // El CRON se enfocará en procesar la cola de imágenes, que es la tarea más pesada.
        // La sincronización de datos se prioriza para la ejecución manual desde el panel.
        self::process_image_batch_cron();
    }

    private static function process_image_batch_cron() {
        global $wpdb;
        $image_batch_size = 50; // Procesar 50 imágenes por ejecución de CRON
        
        $results = $wpdb->get_results($wpdb->prepare(
            "SELECT post_id, meta_value FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue' LIMIT %d",
            10 // Revisa 10 posts con colas de imágenes a la vez
        ));

        if (empty($results)) {
            // No hay colas de imágenes, no hay nada que hacer.
            return;
        }

        $processed_count = 0;

        foreach ($results as $result) {
            if ($processed_count >= $image_batch_size) break;

            $post_id = $result->post_id;
            $queue = maybe_unserialize($result->meta_value);

            if (empty($queue) || !is_array($queue)) {
                delete_post_meta($post_id, '_sav_image_queue');
                continue;
            }

            $url_to_process = array_shift($queue); // Toma la primera imagen de la cola
            $attachment_id = self::sideload_image($url_to_process, $post_id);

            if (!is_wp_error($attachment_id)) {
                $temp_gallery = get_post_meta($post_id, '_sav_temp_gallery', true) ?: [];
                $temp_gallery[] = $attachment_id; // Simplemente añade al final
                update_post_meta($post_id, '_sav_temp_gallery', $temp_gallery);
            }

            $processed_count++;

            if (empty($queue)) {
                // La cola de este post está vacía, finalizar y publicar
                delete_post_meta($post_id, '_sav_image_queue');
                self::finalize_gallery($post_id);
                wp_update_post(['ID' => $post_id, 'post_status' => 'publish']);
            } else {
                // Todavía quedan imágenes, actualizar la cola
                update_post_meta($post_id, '_sav_image_queue', $queue);
            }
        }
    }
}
?>