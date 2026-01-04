<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class Sincro_Vehica_Activator {

    public static function activate() {
        // Crear directorio de logs si no existe
        if ( ! file_exists( SAV_PLUGIN_DIR . 'logs' ) ) {
            wp_mkdir_p( SAV_PLUGIN_DIR . 'logs' );
        }

        // Programar el evento cron si no está ya programado
        if ( ! wp_next_scheduled( 'sincro_vehica_daily_sync' ) ) {
            wp_schedule_event( time(), 'daily', 'sincro_vehica_daily_sync' );
        }
    }

    public static function deactivate() {
        // Desprogramar el evento cron
        wp_clear_scheduled_hook( 'sincro_vehica_daily_sync' );
    }
}