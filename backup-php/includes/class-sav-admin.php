<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SAV_Admin {
    public static function init() {
        add_action('admin_menu', [__CLASS__, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [__CLASS__, 'enqueue_scripts']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
    }

    public static function add_admin_menu() {
        add_menu_page('Sincro Asofix', 'Sincro Asofix', 'manage_options', 'sav-main', [__CLASS__, 'render_main_page'], 'dashicons-update-alt', 26);
        add_submenu_page('sav-main', 'Configuración', 'Configuración', 'manage_options', 'sav-config', [__CLASS__, 'render_config_page']);
    }

    public static function enqueue_scripts($hook) {
        if ($hook !== 'toplevel_page_sav-main' && $hook !== 'sincro-asofix_page_sav-config') return;
        
        wp_enqueue_style('sav-admin-style', SAV_PLUGIN_URL . 'assets/css/admin-style.css', [], SAV_VERSION);
        wp_enqueue_script('sav-admin-js', SAV_PLUGIN_URL . 'assets/js/admin-sync.js', ['jquery'], SAV_VERSION, true);
        wp_localize_script('sav-admin-js', 'sav_ajax', ['ajax_url' => admin_url('admin-ajax.php'), 'nonce' => wp_create_nonce('sav_nonce')]);
    }

    public static function register_settings() {
        register_setting('sav_settings', 'sav_api_key');
        register_setting('sav_settings', 'sav_manual_limit');
        register_setting('sav_settings', 'sav_cron_enabled');
        register_setting('sav_settings', 'sav_blocked_locations');
    }

    public static function render_main_page() {
        ?>
        <div class="wrap sav-wrap">
            <!-- BANNER SUPERIOR -->
            <div style="margin: -10px -20px 20px -20px; border-radius: 0;">
                <img src="<?php echo SAV_PLUGIN_URL; ?>assets/images/SAV.png" alt="Sincronizador Asofix" style="width: 100%; height: auto; display: block; border-radius: 8px;">
            </div>

            <div class="sav-main-grid">
                <div class="sav-card">
                    <h2><span class="dashicons dashicons-admin-generic"></span> Estado del Sistema</h2>
                    <?php self::render_status_widget(); ?>
                </div>
                <div class="sav-card">
                    <h2><span class="dashicons dashicons-database-view"></span> Actividad del Servidor</h2>
                    <div id="sav-cron-log" class="sav-log-box-wrapper">
                        <pre id="sav-cron-log-content">Cargando...</pre>
                    </div>
                    <button id="sav-refresh-cron-log" class="button">Actualizar Log</button>
                </div>
                <div class="sav-card sav-full-width">
                    <h2><span class="dashicons dashicons-controls-play"></span> Sincronización Manual</h2>
                    <div class="sav-phases-container">
                        <?php self::render_phase_box('1', 'Datos', 'Sincroniza vehículos y sus datos. Los posts con imágenes se crearán en borrador.'); ?>
                        <?php self::render_phase_box('2', 'Imágenes', 'Procesa la cola de imágenes de los vehículos en borrador y los publica al finalizar.'); ?>
                        <?php self::render_phase_box('3', 'Limpieza', 'Compara y pasa a borrador los vehículos que ya no están en la API. (Desactivado por seguridad)'); ?>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    private static function render_status_widget() {
        global $wpdb;
        $published = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'vehica_car' AND post_status = 'publish'");
        $drafts = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'vehica_car' AND post_status = 'draft'");
        $image_queue_count = (int) $wpdb->get_var("SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue'");
        
        // OBTENER ÚLTIMA SINCRONIZACIÓN (GMT-3)
        $last_sync_timestamp = (int) $wpdb->get_var("SELECT MAX(meta_value) FROM {$wpdb->postmeta} WHERE meta_key = '_sav_last_update'");
        $timezone = new DateTimeZone('America/Argentina/Buenos_Aires');
        
        if ($last_sync_timestamp > 0) {
            $last_sync = new DateTime('@' . $last_sync_timestamp);
            $last_sync->setTimezone($timezone);
            $last_sync_display = $last_sync->format('H:i:s d/m/Y');
        } else {
            $last_sync_display = 'Nunca';
        }
        
        // OBTENER PRÓXIMA SINCRONIZACIÓN (GMT-3)
        $next_cron = wp_next_scheduled('sav_cron_hook');
        if ($next_cron) {
            $next_cron_date = new DateTime('@' . $next_cron);
            $next_cron_date->setTimezone($timezone);
            $next_cron_display = $next_cron_date->format('H:i:s d/m/Y');
        } else {
            $next_cron_display = 'No programado';
        }
        
        ?>
        <ul class="sav-status-list">
            <li><strong>Vehículos Publicados:</strong> <span><?php echo number_format($published); ?></span></li>
            <li><strong>Vehículos en Borrador:</strong> <span><?php echo number_format($drafts); ?></span></li>
            <li><strong>Imágenes en Cola:</strong> <span><?php echo number_format($image_queue_count); ?></span></li>
            <li style="border-top: 1px solid #eee; margin-top: 10px; padding-top: 10px;">
                <strong>Última Sincronización Automática:</strong><br>
                <span style="color: #667eea; font-size: 13px;"><?php echo $last_sync_display; ?> (GMT-3)</span>
            </li>
            <li>
                <strong>Próxima Sincronización Automática:</strong><br>
                <span style="color: #764ba2; font-size: 13px;"><?php echo $next_cron_display; ?> (GMT-3)</span>
            </li>
        </ul>
        <?php
    }

    private static function render_phase_box($phase, $title, $description) {
        ?>
        <div class="sav-phase-box">
            <h3>Fase <?php echo $phase; ?>: <?php echo $title; ?></h3>
            <p><?php echo $description; ?></p>
            <div class="sav-phase-controls">
                <button id="sav-start-phase-<?php echo $phase; ?>" class="button button-primary">▶ Iniciar Fase <?php echo $phase; ?></button>
                <button id="sav-stop-phase-<?php echo $phase; ?>" class="button button-secondary" style="display:none;">⏸ Detener</button>
            </div>
            <div class="sav-progress-bar">
                <div id="sav-phase-<?php echo $phase; ?>-bar" class="sav-progress-bar-inner"></div>
                <span id="sav-phase-<?php echo $phase; ?>-percentage" class="sav-progress-bar-text">0%</span>
            </div>
            <div id="sav-phase-<?php echo $phase; ?>-status" class="sav-phase-status">En espera.</div>
            <div id="sav-phase-<?php echo $phase; ?>-log" class="sav-log-box"></div>
        </div>
        <?php
    }

    public static function render_config_page() {
        ?>
        <div class="wrap sav-wrap">
            <!-- BANNER SUPERIOR -->
            <div style="margin: -10px -20px 20px -20px;">
                <img src="<?php echo SAV_PLUGIN_URL; ?>assets/images/SAV.png" alt="Sincronizador Asofix" style="width: 100%; height: auto; display: block; border-radius: 8px;">
            </div>

            <h1>Configuración del Sincronizador</h1>
            <form method="post" action="options.php">
                <?php
                settings_fields('sav_settings');
                do_settings_sections('sav_settings');
                ?>
                <div class="sav-card">
                    <h2><span class="dashicons dashicons-admin-settings"></span> Configuración General</h2>
                    <table class="form-table">
                        <tr>
                            <th scope="row"><label for="sav_api_key">API Key de Asofix</label></th>
                            <td><input type="text" id="sav_api_key" name="sav_api_key" value="<?php echo esc_attr(get_option('sav_api_key')); ?>" class="regular-text"/></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="sav_blocked_locations">Ubicaciones a Bloquear</label></th>
                            <td><textarea id="sav_blocked_locations" name="sav_blocked_locations" rows="4" class="large-text"><?php echo esc_textarea(get_option('sav_blocked_locations')); ?></textarea>
                            <p class="description">Una palabra clave por línea. Vehículos en sucursales que contengan estas palabras no se sincronizarán.</p></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="sav_manual_limit">Límite Manual</label></th>
                            <td><input type="number" id="sav_manual_limit" name="sav_manual_limit" value="<?php echo esc_attr(get_option('sav_manual_limit', 0)); ?>" class="small-text"/>
                            <p class="description">Límite de vehículos para la Fase 1. Usa 0 para todos.</p></td>
                        </tr>
                        <tr>
                            <th scope="row"><label for="sav_cron_enabled">Sincronización Automática (CRON)</label></th>
                            <td>
                                <select id="sav_cron_enabled" name="sav_cron_enabled">
                                    <option value="on" <?php selected(get_option('sav_cron_enabled', 'on'), 'on'); ?>>Activado</option>
                                    <option value="off" <?php selected(get_option('sav_cron_enabled', 'on'), 'off'); ?>>Desactivado</option>
                                </select>
                            </td>
                        </tr>
                    </table>
                </div>
                 <div class="sav-card">
                    <h2><span class="dashicons dashicons-hammer"></span> Herramientas de Mantenimiento</h2>
                    <p>Usa estos botones para resolver problemas comunes.</p>
                    <button type="button" id="sav-clear-log" class="button">Limpiar Log del Servidor</button>
                    <button type="button" id="sav-reset-timestamps" class="button button-primary">Resetear Timestamps</button>
                    <p class="description">"Resetear" borra el historial de fechas de actualización. Úsalo si borraste vehículos y el sistema los "omite".</p>
                </div>
                <?php submit_button('Guardar Configuración'); ?>
            </form>
        </div>
        <?php
    }
}