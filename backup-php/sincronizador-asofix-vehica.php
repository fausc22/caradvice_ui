<?php
/**
 * Plugin Name: Sincronizador Asofix
 * Description: Sincroniza vehículos desde la API de Asofix con el tema Vehica.
 * Version: 300.0 (Final Auditado)
 * Author: Lucas Ferreyra  - (DIOP)
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Definiciones de constantes globales para rutas y archivos.
define('SAV_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('SAV_PLUGIN_URL', plugin_dir_url(__FILE__));
define('SAV_LOG_FILE', WP_CONTENT_DIR . '/sincro-asofix-vehica-log.txt');
define('SAV_VERSION', '300.0');

// Carga de los componentes del plugin.
require_once SAV_PLUGIN_DIR . 'includes/class-sav-log.php';
require_once SAV_PLUGIN_DIR . 'includes/class-sav-api.php';
require_once SAV_PLUGIN_DIR . 'includes/class-sav-sync.php';
require_once SAV_PLUGIN_DIR . 'includes/class-sav-admin.php';

// Inicialización de los módulos.
SAV_Admin::init();
SAV_Sync::init();

// Hooks de activación/desactivación para el CRON.
register_activation_hook(__FILE__, ['SAV_Sync', 'activate']);
register_deactivation_hook(__FILE__, ['SAV_Sync', 'deactivate']);