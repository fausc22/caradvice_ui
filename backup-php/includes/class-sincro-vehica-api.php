<?php
// class-sincro-vehica-api.php - v90.0 ("El Limpio")
if ( ! defined( 'ABSPATH' ) ) exit;

class Sincro_Vehica_Api {

    private $api_key;
    private $endpoint = 'https://app.asofix.com/api/catalogs/web';

    public function __construct( ) {
        $this->api_key = get_option('sincro_vehica_api_key', '');
    }

    public function get_vehicles_page($page = 1) {
        if (empty($this->api_key)) {
            return new WP_Error('api_key_missing', 'La API Key no está configurada.');
        }

        $request_url = add_query_arg([
            'page' => $page,
            'per_page' => 10, // Mantenemos un per_page bajo para evitar timeouts
            'include_stock_info' => 'true',
            'include_images' => 'true'
        ], $this->endpoint);

        $response = wp_remote_get($request_url, [
            'headers' => ['x-api-key' => $this->api_key],
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) {
            return $response;
        }

        $http_code = wp_remote_retrieve_response_code($response );
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($http_code >= 400 ) {
            $message = isset($data['message']) ? $data['message'] : 'Error desconocido en la API.';
            return new WP_Error('api_error', "Error en la API de Asofix (Código: {$http_code} ). Mensaje: {$message}");
        }
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('json_decode_error', 'Error al decodificar la respuesta JSON de la API.');
        }

        return ['vehicles' => $data['data'] ?? [], 'pagination' => $data['pagination'] ?? []];
    }
}
?>