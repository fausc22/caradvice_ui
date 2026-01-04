<?php
if ( ! defined( 'ABSPATH' ) ) exit;

class SAV_Api {
    private $api_key;
    private $endpoint = 'https://app.asofix.com/api/catalogs/web';

    public function __construct( ) {
        $this->api_key = get_option('sav_api_key', '');
    }

    public function get_vehicles_page($page = 1) {
        if (empty($this->api_key)) {
            SAV_Log::log("API ERROR: La API Key no está configurada.");
            return new WP_Error('api_key_missing', 'La API Key no está configurada.');
        }
        
        // El límite manual ya no se controla aquí, sino en el JavaScript para
        // detener el bucle de páginas, lo cual es más eficiente.
        // Se mantiene un per_page fijo y razonable.
        $per_page = 20;

        $request_url = add_query_arg([
            'page' => $page, 
            'per_page' => $per_page
        ], $this->endpoint);
        
        SAV_Log::log("API: Intentando obtener página {$page} desde {$request_url}");

        $response = wp_remote_get($request_url, [
            'headers' => ['x-api-key' => $this->api_key],
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) {
            SAV_Log::log("API ERROR: Fallo de conexión cURL: " . $response->get_error_message());
            return $response;
        }

        $http_code = wp_remote_retrieve_response_code($response );
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($http_code !== 200 ) {
            SAV_Log::log("API ERROR: Código de respuesta HTTP {$http_code}." );
            return new WP_Error('api_error', "Error API: {$http_code}" );
        }
        if (json_last_error() !== JSON_ERROR_NONE) {
            SAV_Log::log("API ERROR: Error decodificando la respuesta JSON.");
            return new WP_Error('json_error', 'Error decodificando JSON.');
        }

        SAV_Log::log("API: Página {$page} obtenida correctamente.");
        return ['vehicles' => $data['data'] ?? [], 'pagination' => $data['pagination'] ?? []];
    }
}