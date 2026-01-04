<?php
// Versión 76.0 - "El Optimizador"
header('Content-Type: application/json');

$secret_token = 'a7k9p2m4s6h8f3g1r5t';
if (!isset($_POST['token']) || $_POST['token'] !== $secret_token) {
    http_response_code(403 );
    echo json_encode(['success' => false, 'message' => 'Token inválido.']);
    exit;
}

if (!isset($_POST['image_url']) || !isset($_POST['post_id']) || !isset($_POST['upload_path'])) {
    http_response_code(400 );
    echo json_encode(['success' => false, 'message' => 'Faltan parámetros.']);
    exit;
}

$image_url = filter_var($_POST['image_url'], FILTER_SANITIZE_URL);
$post_id = (int)$_POST['post_id'];
$upload_base_path = $_POST['upload_path'];

$temp_dir = $upload_base_path . '/asofix_temp/' . $post_id;

if (!is_dir($temp_dir)) {
    if (!mkdir($temp_dir, 0755, true)) {
        http_response_code(500 );
        echo json_encode(['success' => false, 'message' => 'No se pudo crear el directorio temporal en: ' . $temp_dir]);
        exit;
    }
}

preg_match('/[^\/\\&\?]+\.\w{3,4}(?=([\?&].*$|$))/', $image_url, $matches);
$filename = $matches ? basename($matches[0]) : 'asofix-image-' . time() . '.jpg';
$destination_path = $temp_dir . '/' . $filename;

$ch = curl_init($image_url);
$fp = fopen($destination_path, 'wb');
curl_setopt($ch, CURLOPT_FILE, $fp);
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 300);
curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE );
curl_close($ch);
fclose($fp);

if ($http_code !== 200 ) {
    @unlink($destination_path);
    http_response_code(500 );
    echo json_encode(['success' => false, 'message' => "Error al descargar la imagen (Código: $http_code )."]);
    exit;
}

echo json_encode(['success' => true, 'path' => $destination_path]);