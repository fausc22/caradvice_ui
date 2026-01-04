<?php
// Versión Funcional - Adaptada a la API de Asofix correcta
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Sincro_Vehica_Api {
    private $api_key;
    private $endpoint = 'https://app.asofix.com/api/catalogs/web'; // <-- ENDPOINT CORRECTO

    public function __construct( ) {
        $this->api_key = get_option('sincro_vehica_api_key', '');
    }

    /**
     * Obtiene una única página de vehículos de la API.
     * Esta es la función que será llamada por el AJAX del panel de admin.
     *
     * @param int $page El número de página a solicitar.
     * @return array|WP_Error Un array con los vehículos y metadatos, o un error.
     */
    public function get_vehicles_page($page = 1) {
        if (empty($this->api_key)) {
            return new WP_Error('api_key_missing', 'La API Key no está configurada en el panel de Sincro Asofix.');
        }

        $request_url = add_query_arg([
            'page' => (int)$page,
            'per_page' => 10, // Número de vehículos por página.
            'include_stock_info' => 'true',
            'include_images' => 'true'
        ], $this->endpoint);

        $response = wp_remote_get($request_url, [
            'headers' => ['x-api-key' => $this->api_key], // <-- HEADER CORRECTO
            'timeout' => 60,
        ]);

        if (is_wp_error($response)) {
            Sincro_Vehica_Log::log_error("Error de WP_Error al contactar la API: " . $response->get_error_message());
            return $response;
        }

        $http_code = wp_remote_retrieve_response_code($response );
        $body = wp_remote_retrieve_body($response);
        
        if (empty($body)) {
            return new WP_Error('empty_response', "La API devolvió una respuesta vacía (Código HTTP: {$http_code} ).");
        }

        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            Sincro_Vehica_Log::log_error("Error fatal al decodificar JSON. Respuesta recibida: " . substr($body, 0, 500));
            return new WP_Error('json_decode_error', 'Error al decodificar la respuesta JSON de la API.');
        }
        
        if ($http_code >= 400 ) {
            $message = $data['message'] ?? 'Error desconocido en la API.';
            Sincro_Vehica_Log::log_error("Error de API {$http_code}: {$message}" );
            return new WP_Error('api_error', "Error en la API de Asofix (Código: {$http_code} ). Mensaje: {$message}");
        }

        // Log para confirmar que recibimos datos
        $vehicle_count = isset($data['data']) ? count($data['data']) : 0;
        Sincro_Vehica_Log::log_info("Respuesta de API recibida para página {$page}. Se encontraron {$vehicle_count} vehículos.");

        // El JS espera un array con una clave 'vehicles'. Lo preparamos.
        return [
            'vehicles' => $data['data'] ?? [],
            'meta' => $data['meta'] ?? [] // También pasamos los metadatos por si son útiles
        ];
    }
}