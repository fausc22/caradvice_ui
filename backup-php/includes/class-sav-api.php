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
            return new WP_Error('api_key_missing', 'La API Key no está configurada.');
        }
        
        $per_page = 20; // Un número fijo y razonable por página

        $request_url = add_query_arg([
            'page' => $page, 
            'per_page' => $per_page,
            'include_images' => 'true' // Parámetro crítico
        ], $this->endpoint);

        $response = wp_remote_get($request_url, [
            'headers' => ['x-api-key' => $this->api_key],
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) return $response;
        $http_code = wp_remote_retrieve_response_code($response );
        if ($http_code !== 200 ) return new WP_Error('api_error', "Error API: {$http_code}" );

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) return new WP_Error('json_error', 'Error decodificando JSON.');

        return ['vehicles' => $data['data'] ?? [], 'pagination' => $data['pagination'] ?? []];
    }
}