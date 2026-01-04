<?php
// class-sincro-vehica-log.php

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

if ( ! class_exists( 'SAV_Log' ) ) {
    class SAV_Log {
        /**
         * Escribe un mensaje de información en el archivo de log.
         * @param string $message El mensaje a registrar.
         */
        public static function info( $message ) {
            // Asegurarse de que la constante está definida antes de usarla.
            if ( defined( 'SAV_LOG_FILE' ) ) {
                // Formatear la línea de log.
                $line = '[' . date( 'Y-m-d H:i:s' ) . '] [INFO] - ' . $message . "\n";
                // Escribir en el archivo, añadiendo al final.
                // El @ suprime errores si el archivo no se puede escribir.
                @file_put_contents( SAV_LOG_FILE, $line, FILE_APPEND );
            }
        }
    }
}
?>