<?php
// class-sincro-vehica-admin.php - v145.16 CORREGIDO
if (!defined('ABSPATH')) exit;

class Sincro_Vehica_Admin {
    
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_assets']);
        add_action('admin_init', [$this, 'register_settings']);
        
        // Registrar todos los AJAX handlers que el JS necesita
        add_action('wp_ajax_sincro_vehica_get_page', ['Sincro_Vehica_Sync', 'ajax_get_page']);
        add_action('wp_ajax_sincro_vehica_process_post_no_images', ['Sincro_Vehica_Sync', 'ajax_process_post_no_images']);
        add_action('wp_ajax_sincro_vehica_find_pending_images', ['Sincro_Vehica_Sync', 'ajax_find_pending_images']);
        add_action('wp_ajax_sincro_vehica_process_single_image', ['Sincro_Vehica_Sync', 'ajax_process_single_image']);
        // ... (otros handlers como clear_log, etc. pueden ir aquí)
    }
    
    public function add_admin_menu() {
        add_menu_page('Sincronizador Asofix', 'Sincro Asofix', 'manage_options', 'sincro-vehica', [$this, 'render_admin_page'], 'dashicons-update', 30);
        add_submenu_page('sincro-vehica', 'Configuración', 'Configuración', 'manage_options', 'sincro-vehica-config', [$this, 'render_config_page']);
    }
    
    public function register_settings() {
        register_setting('sincro_vehica_settings', 'sincro_vehica_api_key');
        register_setting('sincro_vehica_settings', 'sincro_vehica_cron_enabled');
        register_setting('sincro_vehica_settings', 'sincro_vehica_condition_filter');
        register_setting('sincro_vehica_settings', 'sincro_vehica_manual_limit');
    }
    
    public function enqueue_admin_assets($hook) {
        if (strpos($hook, 'sincro-vehica') === false) return;
        
        wp_enqueue_script('jquery');
        wp_enqueue_script(
            'sincro-vehica-admin-js',
            plugin_dir_url(__FILE__) . '../assets/js/admin-sync.js',
            ['jquery'],
            '145.16', // Nueva versión
            true
        );
        
        wp_localize_script('sincro-vehica-admin-js', 'sincro_vehica_ajax', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce'    => wp_create_nonce('sincro_vehica_nonce')
        ]);
    }
    
    public function render_admin_page() {
        // El HTML del panel de Claude. Se asume que es el que proporcionaste antes.
        // Lo importante es que los IDs de los botones y contenedores coincidan con el JS.
        // IDs clave: #start-phase-1-btn, #stop-phase-1-btn, #phase-1-progress, #phase-1-log, etc.
        // El código HTML que me pasaste antes es correcto y se usará tal cual.
        // Por brevedad, no lo repito aquí, pero debe ser el mismo.
        $this->render_full_admin_html();
    }

    private function render_full_admin_html() {
        ?>
        <div class="wrap">
            <h1>Sincronizador Asofix - Vehica</h1>
            <div class="card" style="margin-top: 20px;">
                <h2>📊 Estado de Sincronización Automática (CRON)</h2>
                <?php $this->render_cron_status(); ?>
            </div>
            <div class="card" style="margin-top: 20px;">
                <h2>🔄 Sincronización Manual</h2>
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Fase 1: Sincronización de Datos</h3>
                    <button id="start-phase-1-btn" class="button button-primary button-large">▶ Iniciar Sincronización</button>
                    <button id="stop-phase-1-btn" class="button button-secondary" style="display:none;">⏸ Detener</button>
                    <div id="phase-1-progress" style="display:none; margin-top: 15px;">
                        <div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span id="phase-1-status">Esperando...</span><span id="phase-1-percentage">0%</span></div>
                            <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;"><div id="phase-1-bar" style="background: #0073aa; height: 100%; width: 0%; transition: width 0.3s;"></div></div>
                        </div>
                        <div id="phase-1-log" style="background: #2c3e50; color: #2ecc71; padding: 15px; margin-top: 10px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; border-radius: 4px;"></div>
                    </div>
                </div>
                <div style="border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 4px;">
                    <h3 style="margin-top: 0;">Fase 2: Procesar Imágenes Pendientes</h3>
                    <button id="start-phase-2-btn" class="button button-primary button-large">▶ Procesar Imágenes</button>
                    <button id="stop-phase-2-btn" class="button button-secondary" style="display:none;">⏸ Detener</button>
                    <div id="phase-2-progress" style="display:none; margin-top: 15px;">
                         <div style="background: #f0f0f0; padding: 10px; border-radius: 4px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;"><span id="phase-2-status">Esperando...</span><span id="phase-2-percentage">0%</span></div>
                            <div style="background: #ddd; height: 20px; border-radius: 10px; overflow: hidden;"><div id="phase-2-bar" style="background: #0073aa; height: 100%; width: 0%; transition: width 0.3s;"></div></div>
                        </div>
                        <div id="phase-2-log" style="background: #2c3e50; color: #2ecc71; padding: 15px; margin-top: 10px; max-height: 300px; overflow-y: auto; font-family: 'Courier New', monospace; font-size: 12px; border-radius: 4px;"></div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }
    
    public function render_config_page() { /* ... Código de la página de configuración ... */ }
    private function render_cron_status() { /* ... Código del estado del CRON ... */ }
}