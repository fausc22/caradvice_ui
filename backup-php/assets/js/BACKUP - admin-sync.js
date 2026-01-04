/**
 * admin-sync.js - Sincronizador Asofix Vehica  
 * v145.15 - FIXED
 */

(function() {
    function initAdminSync() {
        if (typeof jQuery === 'undefined' || typeof sincro_vehica_ajax === 'undefined') {
            setTimeout(initAdminSync, 100);
            return;
        }
        
        jQuery(document).ready(function($) {
            
    let syncRunning = false;
    let imagesRunning = false;
    let currentPage = 1;
    let totalPages = 0;
    let processedCount = 0;
    
    // ========================================
    // FASE 1: SINCRONIZACIÓN DE DATOS
    // ========================================
    
    $('#start-phase-1-btn').on('click', function() {
        if (syncRunning) return;
        
        syncRunning = true;
        currentPage = 1;
        totalPages = 0;
        processedCount = 0;
        
        $('#start-phase-1-btn').hide();
        $('#stop-phase-1-btn').show();
        $('#phase-1-progress').show();
        $('#phase-1-log').html('');
        
        logPhase1('🚀 Iniciando sincronización de datos...', 'info');
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_start_phase_1',
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    logPhase1('✓ Sistema preparado', 'success');
                    processNextPage();
                } else {
                    logPhase1('✗ Error: ' + response.data.message, 'error');
                    stopPhase1();
                }
            },
            error: function() {
                logPhase1('✗ Error de conexión', 'error');
                stopPhase1();
            }
        });
    });
    
    $('#stop-phase-1-btn').on('click', function() {
        stopPhase1();
        logPhase1('⏸️ Sincronización detenida manualmente', 'warning');
    });
    
    function processNextPage() {
        if (!syncRunning) return;
        
        updatePhase1Status('📄 Procesando página ' + currentPage + '...');
        logPhase1('📄 Obteniendo página ' + currentPage + '...', 'info');
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_get_page',
                page: currentPage,
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (!response.success) {
                    logPhase1('✗ Error: ' + response.data.message, 'error');
                    stopPhase1();
                    return;
                }
                
                const data = response.data;
                const vehicles = data.vehicles || [];
                const pagination = data.pagination || {};
                
                totalPages = pagination.pages || 1;
                
                if (vehicles.length === 0) {
                    logPhase1('✓ Fin de la sincronización', 'success');
                    updatePhase1Status('✅ Completado');
                    stopPhase1();
                    return;
                }
                
                logPhase1('📊 Página ' + currentPage + '/' + totalPages + ' - ' + vehicles.length + ' vehículos', 'info');
                processVehiclesInPage(vehicles, 0);
            },
            error: function() {
                logPhase1('✗ Error de conexión', 'error');
                stopPhase1();
            }
        });
    }
    
    function processVehiclesInPage(vehicles, index) {
        if (!syncRunning || index >= vehicles.length) {
            currentPage++;
            if (currentPage <= totalPages) {
                setTimeout(processNextPage, 100);
            } else {
                logPhase1('✅ Sincronización completada - ' + processedCount + ' vehículos procesados', 'success');
                updatePhase1Status('✅ Completado');
                stopPhase1();
            }
            return;
        }
        
        const vehicle = vehicles[index];
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_process_post_no_images',
                vehicle_data: JSON.stringify(vehicle),
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    processedCount++;
                    logPhase1('  ✓ ' + response.data.message, 'success');
                } else {
                    logPhase1('  ✗ ' + response.data.message, 'warning');
                }
                
                updatePhase1Status('📄 Página ' + currentPage + '/' + totalPages + ' - Procesados: ' + processedCount);
                updatePhase1Progress();
                
                setTimeout(function() {
                    processVehiclesInPage(vehicles, index + 1);
                }, 50);
            },
            error: function() {
                logPhase1('  ✗ Error al procesar vehículo', 'error');
                setTimeout(function() {
                    processVehiclesInPage(vehicles, index + 1);
                }, 50);
            }
        });
    }
    
    function updatePhase1Progress() {
        if (totalPages > 0) {
            const percentage = Math.round((currentPage / totalPages) * 100);
            $('#phase-1-bar').css('width', percentage + '%');
            $('#phase-1-percentage').text(percentage + '%');
        }
    }
    
    function updatePhase1Status(message) {
        $('#phase-1-status').text(message);
    }
    
    function logPhase1(message, type) {
        const timestamp = new Date().toLocaleTimeString();
        let color = '#4ec9b0';
        
        if (type === 'success') color = '#4ec9b0';
        if (type === 'error') color = '#f48771';
        if (type === 'warning') color = '#dcdcaa';
        if (type === 'info') color = '#9cdcfe';
        
        $('#phase-1-log').append(
            '<div style="color: ' + color + ';">[' + timestamp + '] ' + message + '</div>'
        );
        $('#phase-1-log').scrollTop($('#phase-1-log')[0].scrollHeight);
    }
    
    function stopPhase1() {
        syncRunning = false;
        $('#start-phase-1-btn').show();
        $('#stop-phase-1-btn').hide();
    }
    
    // ========================================
    // FASE 2: PROCESAR IMÁGENES
    // ========================================
    
    let imageJobs = [];
    let currentImageIndex = 0;
    let totalImages = 0;
    
    $('#start-phase-2-btn').on('click', function() {
        if (imagesRunning) return;
        
        imagesRunning = true;
        currentImageIndex = 0;
        
        $('#start-phase-2-btn').hide();
        $('#stop-phase-2-btn').show();
        $('#phase-2-progress').show();
        $('#phase-2-log').html('');
        
        logPhase2('🖼️ Buscando imágenes pendientes...', 'info');
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_find_pending_images',
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    imageJobs = response.data.image_jobs || [];
                    totalImages = imageJobs.length;
                    
                    if (totalImages === 0) {
                        logPhase2('✓ No hay imágenes pendientes', 'success');
                        updatePhase2Status('✅ Sin imágenes pendientes');
                        stopPhase2();
                    } else {
                        logPhase2('📊 ' + totalImages + ' imágenes encontradas', 'success');
                        processNextImage();
                    }
                } else {
                    logPhase2('✗ Error: ' + response.data.message, 'error');
                    stopPhase2();
                }
            },
            error: function() {
                logPhase2('✗ Error de conexión', 'error');
                stopPhase2();
            }
        });
    });
    
    $('#stop-phase-2-btn').on('click', function() {
        stopPhase2();
        logPhase2('⏸️ Procesamiento detenido manualmente', 'warning');
    });
    
    function processNextImage() {
        if (!imagesRunning || currentImageIndex >= totalImages) {
            logPhase2('✅ Completado - ' + totalImages + ' imágenes procesadas', 'success');
            updatePhase2Status('✅ Completado');
            stopPhase2();
            return;
        }
        
        const job = imageJobs[currentImageIndex];
        const progress = Math.round(((currentImageIndex + 1) / totalImages) * 100);
        
        updatePhase2Status('📸 Procesando ' + (currentImageIndex + 1) + '/' + totalImages + ' (' + progress + '%)');
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_process_single_image',
                post_id: job.post_id,
                image_url: job.image_url,
                image_order: job.image_order,
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    logPhase2('  ✓ ' + response.data.message, 'success');
                } else {
                    logPhase2('  ✗ ' + response.data.message, 'error');
                }
                
                currentImageIndex++;
                updatePhase2Progress();
                
                setTimeout(processNextImage, 2000);
            },
            error: function() {
                logPhase2('  ✗ Error al procesar imagen', 'error');
                currentImageIndex++;
                setTimeout(processNextImage, 2000);
            }
        });
    }
    
    function updatePhase2Progress() {
        if (totalImages > 0) {
            const percentage = Math.round((currentImageIndex / totalImages) * 100);
            $('#phase-2-bar').css('width', percentage + '%');
            $('#phase-2-percentage').text(percentage + '%');
        }
    }
    
    function updatePhase2Status(message) {
        $('#phase-2-status').text(message);
    }
    
    function logPhase2(message, type) {
        const timestamp = new Date().toLocaleTimeString();
        let color = '#4ec9b0';
        
        if (type === 'success') color = '#4ec9b0';
        if (type === 'error') color = '#f48771';
        if (type === 'warning') color = '#dcdcaa';
        if (type === 'info') color = '#9cdcfe';
        
        $('#phase-2-log').append(
            '<div style="color: ' + color + ';">[' + timestamp + '] ' + message + '</div>'
        );
        $('#phase-2-log').scrollTop($('#phase-2-log')[0].scrollHeight);
    }
    
    function stopPhase2() {
        imagesRunning = false;
        $('#start-phase-2-btn').show();
        $('#stop-phase-2-btn').hide();
    }
    
    // ========================================
    // FASE 3: LIMPIEZA
    // ========================================
    
    $('#start-phase-3-btn').on('click', function() {
        if (!confirm('¿Estás seguro? Esto pasará a borrador los vehículos que ya no estén en la API.')) {
            return;
        }
        
        const $btn = $(this);
        $btn.prop('disabled', true).text('⏳ Procesando...');
        $('#phase-3-result').show().html('<p>Ejecutando limpieza...</p>');
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_cleanup_phase',
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    $('#phase-3-result').html(
                        '<div style="color: green; font-weight: bold;">✅ ' + response.data.message + '</div>'
                    );
                } else {
                    $('#phase-3-result').html(
                        '<div style="color: red; font-weight: bold;">✗ Error: ' + response.data.message + '</div>'
                    );
                }
                $btn.prop('disabled', false).text('✓ Ejecutar Limpieza');
            },
            error: function() {
                $('#phase-3-result').html(
                    '<div style="color: red; font-weight: bold;">✗ Error de conexión</div>'
                );
                $btn.prop('disabled', false).text('✓ Ejecutar Limpieza');
            }
        });
    });
    
    // ========================================
    // HERRAMIENTAS
    // ========================================
    
    $('#clear-log-btn').on('click', function() {
        if (!confirm('¿Estás seguro de limpiar el archivo de log?')) {
            return;
        }
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_clear_log',
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    alert('✓ Log limpiado correctamente');
                } else {
                    alert('✗ Error: ' + response.data.message);
                }
            },
            error: function() {
                alert('✗ Error de conexión');
            }
        });
    });
    
    $('#reset-timestamps-btn').on('click', function() {
        if (!confirm('¿Estás seguro? Esto forzará una sincronización completa en la próxima ejecución.')) {
            return;
        }
        
        $.ajax({
            url: sincro_vehica_ajax.ajax_url,
            type: 'POST',
            data: {
                action: 'sincro_vehica_reset_timestamps',
                _ajax_nonce: sincro_vehica_ajax.nonce
            },
            success: function(response) {
                if (response.success) {
                    alert('✓ ' + response.data.message);
                } else {
                    alert('✗ Error: ' + response.data.message);
                }
            },
            error: function() {
                alert('✗ Error de conexión');
            }
        });
    });
    
        });
    }
    initAdminSync();
})();