<?php
// class-sincro-vehica-admin.php - v101.0 ("Invalidación de Caché")
if ( ! defined( 'ABSPATH' ) ) exit;

class Sincro_Vehica_Admin {

    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_scripts']);
        
        $ajax_actions = [
            'start_phase_1', 'get_page', 'process_post_no_images',
            'find_pending_images', 'process_single_image', 'cleanup_phase',
            'clear_log_file', 'reset_timestamps'
        ];
        foreach ($ajax_actions as $action) {
            add_action('wp_ajax_sav_' . $action, ['Sincro_Vehica_Sync', 'ajax_' . $action]);
        }
    }

    public function add_admin_menu() {
        add_menu_page('Sincro Asofix', 'Sincro Asofix', 'manage_options', 'sincro-asofix-vehica', [$this, 'create_admin_page'], 'dashicons-update-alt', 26);
    }

    public function enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_sincro-asofix-vehica') {
            return;
        }
        // ===================================================================
        // ===      CAMBIO CLAVE v101.0: FORZAR ACTUALIZACIÓN DE SCRIPT      ===
        // ===================================================================
        wp_enqueue_script(
            'sincro-vehica-admin-js', 
            plugin_dir_url(__FILE__) . '../assets/js/admin-sync.js', 
            ['jquery'], 
            '101.0', // Cambiar este número fuerza al navegador a recargar el archivo
            true
        );
        wp_localize_script('sincro-vehica-admin-js', 'sincroVehica', ['ajax_url' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('sincro_vehica_nonce')]);
    }

    public function create_admin_page() {
        if (isset($_POST['sav_options_nonce']) && wp_verify_nonce($_POST['sav_options_nonce'], 'sav_save_options')) {
            update_option('sincro_vehica_api_key', sanitize_text_field($_POST['api_key']));
            update_option('sincro_vehica_blocked_locations', sanitize_textarea_field($_POST['blocked_locations']));
            update_option('sincro_vehica_manual_limit', intval($_POST['manual_limit']));

            $cron_enabled_before = get_option('sincro_vehica_cron_enabled', 'on') === 'on';
            $cron_enabled_after = isset($_POST['cron_enabled']);
            if ($cron_enabled_after !== $cron_enabled_before) {
                update_option('sincro_vehica_cron_enabled', $cron_enabled_after ? 'on' : 'off');
                if ($cron_enabled_after) {
                    if (!wp_next_scheduled('sav_cron_sync_hook')) {
                        wp_schedule_event(time(), 'hourly', 'sav_cron_sync_hook');
                    }
                } else {
                    $timestamp = wp_next_scheduled('sav_cron_sync_hook');
                    if ($timestamp) {
                        wp_unschedule_event($timestamp, 'sav_cron_sync_hook');
                    }
                }
            }
            echo '<div class="notice notice-success is-dismissible"><p>Opciones guardadas.</p></div>';
        }
        ?>
        <div class="wrap">
            <h1>Sincronizador Asofix - Vehica (SAV)</h1>
            <p>Este panel te permite configurar y ejecutar la sincronización de vehículos desde la API de Asofix.</p>

            <div id="sav-main-container" style="display: flex; gap: 20px;">
                <div id="sav-left-column" style="flex: 1;">
                    
                    <form method="post" action="">
                        <?php wp_nonce_field('sav_save_options', 'sav_save_options'); ?>
                        <h2>Configuración General y Manual</h2>
                        <table class="form-table">
                            <tr valign="top">
                                <th scope="row"><label for="api_key">API Key de Asofix</label></th>
                                <td><input type="text" id="api_key" name="api_key" value="<?php echo esc_attr(get_option('sincro_vehica_api_key')); ?>" class="regular-text"/></td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><label for="blocked_locations">Sucursales Bloqueadas</label></th>
                                <td>
                                    <textarea id="blocked_locations" name="blocked_locations" rows="5" class="large-text"><?php echo esc_textarea(get_option('sincro_vehica_blocked_locations')); ?></textarea>
                                    <p class="description">Una sucursal por línea.</p>
                                </td>
                            </tr>
                            <tr valign="top">
                                <th scope="row"><label for="manual_limit">Límite de vehículos (Sincro. Manual)</label></th>
                                <td>
                                    <input type="number" id="manual_limit" name="manual_limit" value="<?php echo esc_attr(get_option('sincro_vehica_manual_limit', 10)); ?>" min="1" max="500" />
                                    <p class="description">Limita la cantidad de vehículos a procesar en la Fase 1 de la sincronización manual.</p>
                                </td>
                            </tr>
                        </table>

                        <hr>
                        <h2>Automatización (WP-Cron)</h2>
                        <table class="form-table">
                            <tr valign="top">
                                <th scope="row">Activar Sincronización Automática</th>
                                <td>
                                    <input type="checkbox" name="cron_enabled" <?php checked(get_option('sincro_vehica_cron_enabled', 'on'), 'on'); ?> />
                                    <label>Ejecutar la sincronización cada hora.</label>
                                </td>
                            </tr>
                        </table>
                        <?php
                        $timestamp = wp_next_scheduled('sav_cron_sync_hook');
                        if ($timestamp) {
                            echo '<p><strong>Próxima ejecución:</strong> ' . get_date_from_gmt(date('Y-m-d H:i:s', $timestamp), 'Y-m-d H:i:s') . '</p>';
                        } else {
                            echo '<p><strong>La sincronización automática no está programada.</strong></p>';
                        }
                        ?>
                        <?php submit_button('Guardar Toda la Configuración'); ?>
                    </form>

                    <hr>
                    <h2>Sincronización Manual</h2>
                    <p>Ejecuta el proceso de sincronización usando el límite guardado arriba.</p>
                    <p>
                        <button id="start-full-sync" class="button button-primary">¡Iniciar Sincronización Completa!</button>
                        <button id="stop-sync" class="button" style="display:none;">Detener Proceso</button>
                    </p>
                    <div id="sync-progress-bar-container" style="height: 20px; background: #eee; border-radius: 5px; overflow: hidden; display: none;">
                        <div id="sync-progress-bar" style="width: 0%; height: 100%; background: #0073aa; transition: width 0.5s;"></div>
                    </div>
                    <p id="sync-status"></p>
                </div>

                <div id="sav-right-column" style="flex: 1; max-width: 50%;">
                    <h2>Log en Tiempo Real (Navegador)</h2>
                    <pre id="realtime-log" style="height: 300px; overflow-y: scroll; background: #f1f1f1; padding: 10px; border: 1px solid #ccc; white-space: pre-wrap;"></pre>
                    
                    <h2>Mantenimiento</h2>
                    <p>
                        <button id="reset-timestamps-btn" class="button">Forzar Reseteo de Timestamps</button>
                        <span id="reset-timestamps-status"></span>
                    </p>
                    <p class="description">Borra todos los registros de fechas de última actualización.</p>
                    
                    <hr>
                    <h2>Visor de Log del Servidor</h2>
                    <pre style="height: 200px; overflow-y: scroll; background: #222; color: #0f0; padding: 10px; border: 1px solid #ccc; white-space: pre-wrap;"><?php
                        $log_file = defined('SAV_LOG_FILE') ? SAV_LOG_FILE : '';
                        if ($log_file && file_exists($log_file)) {
                            echo esc_html(file_get_contents($log_file));
                        } else {
                            echo 'El archivo de log no existe.';
                        }
                    ?></pre>
                    <p>
                        <button id="clear-log-btn" class="button">Limpiar Log del Servidor</button>
                        <span id="clear-log-status"></span>
                    </p>
                </div>
            </div>
        </div>
        <?php
    }
}
?>