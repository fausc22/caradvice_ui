<?php
// class-sincro-vehica-admin.php - v145.15 CORREGIDO
// Incluye: Estado CRON, Fases Manuales, Log del Servidor, Herramientas
if (!defined('ABSPATH')) exit;

class Sincro_Vehica_Admin {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        
        // AJAX handlers
        add_action('wp_ajax_sincro_vehica_start_phase_1', ['Sincro_Vehica_Sync', 'ajax_start_phase_1']);
        add_action('wp_ajax_sincro_vehica_get_page', ['Sincro_Vehica_Sync', 'ajax_get_page']);
        add_action('wp_ajax_sincro_vehica_process_post_no_images', ['Sincro_Vehica_Sync', 'ajax_process_post_no_images']);
        add_action('wp_ajax_sincro_vehica_find_pending_images', ['Sincro_Vehica_Sync', 'ajax_find_pending_images']);
        add_action('wp_ajax_sincro_vehica_process_single_image', ['Sincro_Vehica_Sync', 'ajax_process_single_image']);
        add_action('wp_ajax_sincro_vehica_cleanup_phase', ['Sincro_Vehica_Sync', 'ajax_cleanup_phase']);
        add_action('wp_ajax_sincro_vehica_clear_log', ['Sincro_Vehica_Sync', 'ajax_clear_log_file']);
        add_action('wp_ajax_sincro_vehica_reset_timestamps', ['Sincro_Vehica_Sync', 'ajax_reset_timestamps']);
        add_action('wp_ajax_sincro_vehica_get_server_log', ['Sincro_Vehica_Sync', 'ajax_get_server_log']);
        
        // Settings
        add_action('admin_init', [$this, 'register_settings']);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'Sincronizador Asofix',
            'Sincro Asofix',
            'manage_options',
            'sincro-vehica',
            [$this, 'render_admin_page'],
            'dashicons-update',
            30
        );
        
        add_submenu_page(
            'sincro-vehica',
            'Configuración',
            'Configuración',
            'manage_options',
            'sincro-vehica-config',
            [$this, 'render_config_page']
        );
    }
    
    public function register_settings() {
        register_setting('sincro_vehica_settings', 'sincro_vehica_api_key');
        register_setting('sincro_vehica_settings', 'sincro_vehica_cron_enabled');
        register_setting('sincro_vehica_settings', 'sincro_vehica_cron_time');
        register_setting('sincro_vehica_settings', 'sincro_vehica_condition_filter');
        register_setting('sincro_vehica_settings', 'sincro_vehica_blocked_locations');
        register_setting('sincro_vehica_settings', 'sincro_vehica_manual_limit');
    }
    
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'sincro-vehica') === false) {
            return;
        }
        
        // Asegurar que jQuery esté cargado
        wp_enqueue_script('jquery');
        
        // CORREGIDO: Cargar en footer con dependencia de jQuery
        wp_enqueue_script(
            'sincro-vehica-admin-js',
            plugin_dir_url(__FILE__) . '../assets/js/admin-sync.js',
            ['jquery'], // Dependencia de jQuery
            '145.15',
            true // Cargar en footer
        );
        
        // CORREGIDO: Variable correcta
        wp_localize_script('sincro-vehica-admin-js', 'sincro_vehica_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('sincro_vehica_nonce')
        ]);
    }
    
    /**
     * Página principal: Estado + Sincronización Manual + Log
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>Sincronizador Asofix - Vehica</h1>
            
            <!-- SECCIÓN 1: Estado del CRON -->
            <div class="card" style="margin-top: 20px;">
                <h2>📊 Estado de Sincronización Automática (CRON)</h2>
                <?php $this->render_cron_status(); ?>
            </div>
            
            <!-- SECCIÓN 2: Sincronización Manual por Fases -->
            <div class="card" style="margin-top: 20px;">
                <h2>🔄 Sincronización Manual</h2>
                <p><strong>Proceso en 3 fases independientes:</strong></p>
                
                <!-- Fase 1: Datos -->
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Fase 1: Sincronización de Datos</h3>
                    <p>Sincroniza los datos de vehículos desde la API de Asofix (sin imágenes).</p>
                    <button id="start-phase-1-btn" class="button button-primary button-large">
                        ▶ Iniciar Sincronización
                    </button>
                    <button id="stop-phase-1-btn" class="button button-secondary" style="display:none;">
                        ⏸ Detener
                    </button>
                    
                    <div id="phase-1-progress" style="display:none; margin-top: 15px;">
                        <div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span id="phase-1-status">Esperando...</span>
                                <span id="phase-1-percentage">0%</span>
                            </div>
                            <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;">
                                <div id="phase-1-bar" style="background: #0073aa; height: 100%; width: 0%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div id="phase-1-log" style="background: #2c3e50; color: #2ecc71; padding: 15px; margin-top: 10px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; border-radius: 4px;"></div>
                    </div>
                </div>
                
                <!-- Fase 2: Imágenes -->
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Fase 2: Procesar Imágenes Pendientes</h3>
                    <p>Procesa las imágenes pendientes de descarga.</p>
                    <p style="background: #fff3cd; padding: 10px; border-left: 4px solid #ffc107;">
                        ⚠️ <strong>v145.15:</strong> Las imágenes se procesan SECUENCIALMENTE para mantener el orden correcto. La primera imagen de la API será la imagen destacada.
                    </p>
                    
                    <button id="start-phase-2-btn" class="button button-primary button-large">
                        ▶ Procesar Imágenes Pendientes
                    </button>
                    <button id="stop-phase-2-btn" class="button button-secondary" style="display:none;">
                        ⏸ Detener
                    </button>
                    
                    <div id="phase-2-progress" style="display:none; margin-top: 15px;">
                        <div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span id="phase-2-status">Esperando...</span>
                                <span id="phase-2-percentage">0%</span>
                            </div>
                            <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;">
                                <div id="phase-2-bar" style="background: #0073aa; height: 100%; width: 0%; transition: width 0.3s;"></div>
                            </div>
                        </div>
                        <div id="phase-2-log" style="background: #2c3e50; color: #2ecc71; padding: 15px; margin-top: 10px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; border-radius: 4px;"></div>
                    </div>
                </div>
                
                <!-- Fase 3: Limpieza -->
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Fase 3: Limpieza</h3>
                    <p>Pasa a borrador los vehículos que ya no están disponibles en la API.</p>
                    <button id="start-phase-3-btn" class="button button-primary button-large">
                        ✓ Ejecutar Limpieza
                    </button>
                    
                    <div id="phase-3-result" style="display:none; margin-top: 15px; padding: 15px; background: #f0f0f0; border-radius: 4px;"></div>
                </div>
            </div>
            
            <!-- SECCIÓN 3: Visualizador de Log del Servidor -->
            <div class="card" style="margin-top: 20px;">
                <h2>📄 Log del Servidor</h2>
                <p>Archivo: <code>/home/l0010101/public_html/wp-content/sincro-asofix-vehica-log.txt</code></p>
                
                <button id="view-log-btn" class="button">👁️ Ver Log Completo</button>
                <button id="refresh-log-btn" class="button">🔄 Actualizar</button>
                
                <div id="server-log-viewer" style="display:none; margin-top: 15px;">
                    <div style="background: #2c3e50; color: #ecf0f1; padding: 20px; max-height: 600px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 11px; border-radius: 4px; white-space: pre-wrap; word-wrap: break-word;">
                        <div id="server-log-content">Cargando...</div>
                    </div>
                </div>
            </div>
            
            <!-- SECCIÓN 4: Herramientas de Mantenimiento -->
            <div class="card" style="margin-top: 20px;">
                <h2>🛠️ Herramientas de Mantenimiento</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Limpiar Log de Sincronización</th>
                        <td>
                            <button id="clear-log-btn" class="button">🗑️ Limpiar Log</button>
                            <p class="description">Vacía el archivo de log del plugin.</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Resetear Timestamps</th>
                        <td>
                            <button id="reset-timestamps-btn" class="button">🔄 Resetear Timestamps</button>
                            <p class="description">Fuerza la actualización completa de todos los vehículos en la próxima sincronización.</p>
                        </td>
                    </tr>
                </table>
            </div>
            
            <!-- SECCIÓN 5: Información de Versión -->
            <div class="card" style="margin-top: 20px;">
                <h2>ℹ️ Información de Versión</h2>
                <table class="form-table">
                    <tr>
                        <th scope="row">Versión Plugin:</th>
                        <td><strong>v145.15</strong></td>
                    </tr>
                    <tr>
                        <th scope="row">Mejoras v145.15:</th>
                        <td>
                            <ul>
                                <li>✅ Lógica de precios EXACTA de Manus v69.0</li>
                                <li>✅ FIX: No publica posts con cola de imágenes pendientes</li>
                                <li>✅ Draft-to-publish workflow completo</li>
                                <li>✅ Organización de imágenes en subcarpetas</li>
                                <li>✅ Procesamiento secuencial para mantener orden</li>
                                <li>✅ Primera imagen de API = Imagen destacada</li>
                            </ul>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Sincronización CRON:</th>
                        <td><?php echo get_option('sincro_vehica_cron_enabled', 'on') === 'on' ? '<span style="color: green;">✓ Activa (cada 1 hora)</span>' : '<span style="color: red;">✗ Desactivada</span>'; ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Filtro de Condición:</th>
                        <td><?php 
                        $filter = get_option('sincro_vehica_condition_filter', 'used');
                        if ($filter === 'all') echo 'Todos (0KM y Usados)';
                        elseif ($filter === 'used') echo 'Solo Usados';
                        else echo 'Solo 0KM';
                        ?></td>
                    </tr>
                    <tr>
                        <th scope="row">Límite Manual:</th>
                        <td><?php 
                        $limit = get_option('sincro_vehica_manual_limit', 0);
                        echo $limit > 0 ? $limit . ' vehículos' : 'Sin límite';
                        ?></td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }
    
    /**
     * Página separada: Configuración
     */
    public function render_config_page() {
        ?>
        <div class="wrap">
            <h1>Configuración - Sincronizador Asofix</h1>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('sincro_vehica_settings');
                do_settings_sections('sincro_vehica_settings');
                ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row"><label for="sincro_vehica_api_key">API Key de Asofix</label></th>
                        <td>
                            <input type="text" id="sincro_vehica_api_key" name="sincro_vehica_api_key" 
                                   value="<?php echo esc_attr(get_option('sincro_vehica_api_key', '')); ?>" 
                                   class="regular-text" />
                            <p class="description">Clave de API proporcionada por Asofix</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><label for="sincro_vehica_cron_enabled">Sincronización Automática (CRON)</label></th>
                        <td>
                            <select id="sincro_vehica_cron_enabled" name="sincro_vehica_cron_enabled">
                                <option value="on" <?php selected(get_option('sincro_vehica_cron_enabled', 'on'), 'on'); ?>>Habilitado</option>
                                <option value="off" <?php selected(get_option('sincro_vehica_cron_enabled', 'on'), 'off'); ?>>Deshabilitado</option>
                            </select>
                            <p class="description">Ejecuta sincronización automática cada hora</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><label for="sincro_vehica_cron_time">Hora de Ejecución CRON</label></th>
                        <td>
                            <input type="time" id="sincro_vehica_cron_time" name="sincro_vehica_cron_time" 
                                   value="<?php echo esc_attr(get_option('sincro_vehica_cron_time', '03:00')); ?>" />
                            <p class="description">Hora local para ejecutar la sincronización automática</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><label for="sincro_vehica_condition_filter">Filtro por Condición</label></th>
                        <td>
                            <select id="sincro_vehica_condition_filter" name="sincro_vehica_condition_filter">
                                <option value="all" <?php selected(get_option('sincro_vehica_condition_filter', 'used'), 'all'); ?>>Todos (0KM y Usados)</option>
                                <option value="used" <?php selected(get_option('sincro_vehica_condition_filter', 'used'), 'used'); ?>>Solo Usados</option>
                                <option value="new" <?php selected(get_option('sincro_vehica_condition_filter', 'used'), 'new'); ?>>Solo 0KM</option>
                            </select>
                            <p class="description">Filtra qué vehículos sincronizar según su condición</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><label for="sincro_vehica_blocked_locations">Ubicaciones Bloqueadas</label></th>
                        <td>
                            <textarea id="sincro_vehica_blocked_locations" name="sincro_vehica_blocked_locations" 
                                      rows="5" class="large-text"><?php echo esc_textarea(get_option('sincro_vehica_blocked_locations', '')); ?></textarea>
                            <p class="description">Una ubicación por línea. Los vehículos en estas ubicaciones NO se sincronizarán.</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row"><label for="sincro_vehica_manual_limit">Límite para Sincronización Manual</label></th>
                        <td>
                            <input type="number" id="sincro_vehica_manual_limit" name="sincro_vehica_manual_limit" 
                                   value="<?php echo esc_attr(get_option('sincro_vehica_manual_limit', 0)); ?>" 
                                   min="0" step="1" class="small-text" />
                            <p class="description">0 = sin límite. Útil para pruebas (ejemplo: 10 para procesar solo 10 vehículos)</p>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Guardar Configuración'); ?>
            </form>
        </div>
        <?php
    }
    
    /**
     * Renderiza el estado del CRON con hora local
     */
    private function render_cron_status() {
        // Timezone de WordPress
        $timezone_string = get_option('timezone_string');
        if (empty($timezone_string)) {
            $offset = get_option('gmt_offset');
            $timezone_string = timezone_name_from_abbr('', $offset * 3600, 0);
        }
        
        $timezone = new DateTimeZone($timezone_string ?: 'UTC');
        
        // Estado del CRON
        $cron_enabled = get_option('sincro_vehica_cron_enabled', 'on');
        $is_enabled = ($cron_enabled === 'on');
        
        // Próxima ejecución
        $next_timestamp = wp_next_scheduled('sincro_vehica_daily_sync_event');
        
        // Última ejecución (de la tabla de sync_dates)
        global $wpdb;
        $dates_table = $wpdb->prefix . 'sav_sync_dates';
        $last_sync_timestamp = $wpdb->get_var("SELECT MAX(last_update_ts) FROM {$dates_table}");
        
        // Estadísticas
        $total_posts = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'vehica_car' AND post_status = 'publish'");
        $pending_images = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = '_sav_image_queue'");
        $draft_posts = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'vehica_car' AND post_status = 'draft'");
        
        // Posts con USD y ARS
        $usd_posts = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = 'vehica_currency_6656_2577' AND meta_value > 0");
        $ars_posts = $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->postmeta} WHERE meta_key = 'vehica_currency_6656_2316' AND meta_value > 0");
        
        ?>
        <table class="widefat" style="margin-top: 15px;">
            <thead>
                <tr>
                    <th colspan="2" style="background: #0073aa; color: white; padding: 10px;">
                        <strong>Estado del Sistema</strong>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="width: 30%; padding: 12px;"><strong>🔄 CRON Automático:</strong></td>
                    <td style="padding: 12px;">
                        <?php if ($is_enabled): ?>
                            <span style="color: green; font-weight: bold;">✓ HABILITADO</span>
                        <?php else: ?>
                            <span style="color: red; font-weight: bold;">✗ DESHABILITADO</span>
                        <?php endif; ?>
                    </td>
                </tr>
                
                <?php if ($next_timestamp): ?>
                <tr>
                    <td style="padding: 12px;"><strong>⏰ Próxima Ejecución:</strong></td>
                    <td style="padding: 12px;">
                        <?php
                        $next_date = new DateTime('@' . $next_timestamp);
                        $next_date->setTimezone($timezone);
                        echo '<strong style="color: #0073aa;">' . $next_date->format('Y-m-d H:i:s') . '</strong>';
                        echo ' <span style="color: #666;">(' . $timezone_string . ')</span>';
                        
                        // Tiempo restante
                        $now = new DateTime('now', $timezone);
                        $interval = $now->diff($next_date);
                        
                        if ($next_timestamp > time()) {
                            $hours = $interval->h + ($interval->days * 24);
                            echo '<br><span style="color: #666; font-size: 12px;">En ' . $hours . ' horas, ' . $interval->i . ' minutos</span>';
                        }
                        ?>
                    </td>
                </tr>
                <?php else: ?>
                <tr>
                    <td style="padding: 12px;"><strong>⏰ Próxima Ejecución:</strong></td>
                    <td style="padding: 12px;">
                        <span style="color: orange;">⚠️ NO HAY CRON PROGRAMADO</span>
                        <br><span style="font-size: 12px; color: #666;">Desactiva y reactiva el plugin para programar el CRON</span>
                    </td>
                </tr>
                <?php endif; ?>
                
                <?php if ($last_sync_timestamp): ?>
                <tr>
                    <td style="padding: 12px;"><strong>📅 Última Sincronización:</strong></td>
                    <td style="padding: 12px;">
                        <?php
                        $last_date = new DateTime('@' . $last_sync_timestamp);
                        $last_date->setTimezone($timezone);
                        echo '<strong>' . $last_date->format('Y-m-d H:i:s') . '</strong>';
                        echo ' <span style="color: #666;">(' . $timezone_string . ')</span>';
                        
                        // Tiempo transcurrido
                        $now = new DateTime('now', $timezone);
                        $interval = $last_date->diff($now);
                        
                        if ($interval->days > 0) {
                            echo '<br><span style="color: #666; font-size: 12px;">Hace ' . $interval->days . ' días</span>';
                        } else {
                            echo '<br><span style="color: #666; font-size: 12px;">Hace ' . $interval->h . ' horas, ' . $interval->i . ' minutos</span>';
                        }
                        ?>
                    </td>
                </tr>
                <?php else: ?>
                <tr>
                    <td style="padding: 12px;"><strong>📅 Última Sincronización:</strong></td>
                    <td style="padding: 12px;">
                        <span style="color: #999;">Nunca ejecutada</span>
                    </td>
                </tr>
                <?php endif; ?>
                
                <tr>
                    <td colspan="2" style="background: #f5f5f5; padding: 10px;">
                        <strong>Estadísticas:</strong>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 12px;"><strong>📊 Vehículos Publicados:</strong></td>
                    <td style="padding: 12px;">
                        <strong style="color: green; font-size: 18px;"><?php echo number_format($total_posts); ?></strong>
                        <?php if ($draft_posts > 0): ?>
                            <br><span style="color: orange; font-size: 12px;">+ <?php echo $draft_posts; ?> en borrador (esperando imágenes)</span>
                        <?php endif; ?>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 12px;"><strong>💵 Distribución de Precios:</strong></td>
                    <td style="padding: 12px;">
                        <strong style="color: #0073aa;">USD:</strong> <?php echo number_format($usd_posts); ?> vehículos
                        <br>
                        <strong style="color: #0073aa;">ARS:</strong> <?php echo number_format($ars_posts); ?> vehículos
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 12px;"><strong>🖼️ Imágenes Pendientes:</strong></td>
                    <td style="padding: 12px;">
                        <?php if ($pending_images > 0): ?>
                            <strong style="color: orange; font-size: 18px;"><?php echo number_format($pending_images); ?></strong>
                            <span style="color: #666;">posts con imágenes en cola</span>
                        <?php else: ?>
                            <strong style="color: green;">✓ Sin imágenes pendientes</strong>
                        <?php endif; ?>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 12px;"><strong>🕐 Zona Horaria:</strong></td>
                    <td style="padding: 12px;">
                        <?php echo $timezone_string; ?>
                    </td>
                </tr>
            </tbody>
        </table>
        
        <?php if ($pending_images > 0): ?>
        <div style="margin-top: 15px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107;">
            <strong>⚠️ Atención:</strong> Hay <?php echo $pending_images; ?> posts con imágenes pendientes de descarga.
            El CRON las procesará en la próxima ejecución (lotes de 50 imágenes).
        </div>
        <?php endif; ?>
        <?php
    }
}