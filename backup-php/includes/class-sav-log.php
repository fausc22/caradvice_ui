<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SAV_Log {
    private static $log_file;

    public static function init() {
        self::$log_file = WP_CONTENT_DIR . '/sincro-asofix-vehica-log.txt';
    }

    public static function log($message) {
        $timestamp = new DateTime("now", new DateTimeZone('America/Argentina/Buenos_Aires'));
        $formatted_message = '[' . $timestamp->format('Y-m-d H:i:s') . '] - ' . $message . "\n";
        file_put_contents(self::$log_file, $formatted_message, FILE_APPEND);
    }

    public static function read_log() {
        if (file_exists(self::$log_file)) {
            return file_get_contents(self::$log_file);
        }
        return 'El archivo de log aún no ha sido creado.';
    }

    public static function clear_log() {
        if (file_exists(self::$log_file)) {
            file_put_contents(self::$log_file, '');
        }
    }
}