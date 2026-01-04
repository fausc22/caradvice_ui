<?php
// Versión 33.0 - Modo Sigiloso (Anti-Firewall)

// Cargamos el entorno de WordPress manualmente
$wp_load_path = realpath('../../../wp-load.php');
if (!file_exists($wp_load_path)) { die('Error crítico: No se pudo encontrar el archivo wp-load.php.'); }
require_once($wp_load_path);

// Verificación de seguridad
if (!current_user_can('manage_options')) { wp_die('Acceso denegado.'); }

// Función para imprimir la interfaz de progreso
function print_header_and_styles() {
    echo '<!DOCTYPE html><html><head><title>Sincronizando Vehículos...</title><style>body{font-family:sans-serif;background:#f0f2f5;color:#333;padding:20px}.container{max-width:800px;margin:40px auto;padding:20px;background:#fff;box-shadow:0 4px 15px rgba(0,0,0,0.1)}h1{color:#005a87}#progress-bar{width:100%;background:#e0e0e0;overflow:hidden;margin:20px 0}#progress-bar-inner{width:0%;height:30px;background:#0073aa;color:white;text-align:center;line-height:30px;transition:width .5s}#log{font-family:monospace;font-size:14px;background:#fafafa;border:1px solid #ddd;padding:15px;max-height:400px;overflow-y:auto;white-space:pre-wrap}.log-ok{color:#228b22}.log-error{color:#dc3545;font-weight:bold}.log-info{color:#666}.log-omit{color:#ffa500}</style></head><body><div class="container"><h1>Sincronización Manual (Modo Sigiloso)</h1><div id="progress-bar"><div id="progress-bar-inner">0%</div></div><div id="log">';
    ob_flush(); flush();
}

// Función para actualizar el progreso en la pantalla
function update_progress($message, $type = 'info', $progress = -1) {
    echo '<div class="log-' . $type . '">[' . date('H:i:s') . '] ' . esc_html($message) . '</div>';
    if ($progress >= 0) {
        echo '<script>document.getElementById("progress-bar-inner").style.width="' . $progress . '%";document.getElementById("progress-bar-inner").textContent="' . $progress . '%";</script>';
    }
    ob_flush(); flush();
}

function print_footer() {
    echo '</div><div style="text-align:center;margin-top:20px;font-size:12px;color:#888;">Proceso finalizado.</div></div></body></html>';
    ob_flush(); flush();
}

// --- INICIO DEL PROCESO ---
@set_time_limit(0); // Intentar evitar el timeout del script
ob_start();
print_header_and_styles();

// 1. Preparar la cola de vehículos
update_progress('Iniciando preparación de la cola de vehículos...', 'info');
$queue = Sincro_Vehica_Sync::prepare_vehicle_queue();

if (is_wp_error($queue)) {
    update_progress('ERROR FATAL al preparar la cola: ' . $queue->get_error_message(), 'error');
    print_footer();
    exit;
}

$total_vehicles = count($queue);
if ($total_vehicles === 0) {
    update_progress('No se encontraron vehículos activos para sincronizar.', 'info', 100);
    print_footer();
    exit;
}

update_progress("Se encontraron $total_vehicles vehículos para procesar. Iniciando sincronización...", 'info');
sleep(1);

// 2. Procesar cada vehículo
$processed_count = 0;
foreach ($queue as $vehicle_data) {
    $processed_count++;
    $progress = round(($processed_count / $total_vehicles) * 100);
    $asofix_id = $vehicle_data['id'] ?? 'ID_DESCONOCIDO';
    update_progress("Procesando vehículo $processed_count de $total_vehicles (ID: $asofix_id)...", 'info');
    
    $result = Sincro_Vehica_Sync::sync_single_vehicle_manual($vehicle_data);

    if (is_wp_error($result)) {
        update_progress('ERROR al procesar ' . $asofix_id . ': ' . $result->get_error_message(), 'error', $progress);
    } elseif (strpos($result, 'OMITIDO') !== false) {
        update_progress($result, 'omit', $progress);
    } else {
        update_progress($result, 'ok', $progress);
    }
    
    // Pausa crucial para no parecer un ataque
    sleep(3);
}

update_progress('¡Sincronización completada!', 'info', 100);
print_footer();
?>