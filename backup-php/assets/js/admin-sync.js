/**
 * admin-sync.js v300.0 - Compatible
 */
jQuery(document).ready(function($) {
    if (typeof sav_ajax === 'undefined') {
        console.error('SAV: sav_ajax no disponible');
        return;
    }

    var phase1Running = false;
    var phase2Running = false;

    // FASE 1
    $('#sav-start-phase-1').on('click', function() {
        if (phase1Running) return;
        phase1Running = true;
        $('#sav-start-phase-1').hide();
        $('#sav-stop-phase-1').show();
        $('#sav-phase-1-log').html('');
        logPhase1('Iniciando...', 'info');
        processPage1(1);
    });

    $('#sav-stop-phase-1').on('click', function() {
        phase1Running = false;
        $('#sav-start-phase-1').show();
        $('#sav-stop-phase-1').hide();
    });

    function processPage1(page) {
        if (!phase1Running) return;
        
        $.post(sav_ajax.ajax_url, {
            action: 'sav_get_page',
            page: page,
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            if (!res.success || !res.data.vehicles || res.data.vehicles.length === 0) {
                logPhase1('Completado', 'success');
                phase1Running = false;
                $('#sav-start-phase-1').show();
                $('#sav-stop-phase-1').hide();
                return;
            }
            
            logPhase1('Página ' + page + ': ' + res.data.vehicles.length + ' vehículos', 'info');
            processVehicles1(res.data.vehicles, 0, function() {
                processPage1(page + 1);
            });
        }).fail(function() {
            logPhase1('Error de conexión', 'error');
            phase1Running = false;
        });
    }

    function processVehicles1(vehicles, index, callback) {
        if (!phase1Running || index >= vehicles.length) {
            callback();
            return;
        }

        $.post(sav_ajax.ajax_url, {
            action: 'sav_process_vehicle',
            vehicle_data: JSON.stringify(vehicles[index]),
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            logPhase1(res.data.message, res.success ? 'success' : 'error');
        }).always(function() {
            setTimeout(function() {
                processVehicles1(vehicles, index + 1, callback);
            }, 100);
        });
    }

    function logPhase1(msg, type) {
        var colors = {info: '#9cdcfe', success: '#4ec9b0', error: '#f48771'};
        var time = new Date().toLocaleTimeString();
        $('#sav-phase-1-log').append('<div style="color:' + colors[type] + '">[' + time + '] ' + msg + '</div>');
        $('#sav-phase-1-log').scrollTop($('#sav-phase-1-log')[0].scrollHeight);
    }

    // FASE 2
    $('#sav-start-phase-2').on('click', function() {
        if (phase2Running) return;
        phase2Running = true;
        $('#sav-start-phase-2').hide();
        $('#sav-stop-phase-2').show();
        $('#sav-phase-2-log').html('');
        logPhase2('Buscando imágenes...', 'info');

        $.post(sav_ajax.ajax_url, {
            action: 'sav_find_pending_images',
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            if (!res.success || !res.data.image_jobs || res.data.image_jobs.length === 0) {
                logPhase2('Sin imágenes pendientes', 'success');
                phase2Running = false;
                $('#sav-start-phase-2').show();
                $('#sav-stop-phase-2').hide();
                return;
            }
            logPhase2(res.data.image_jobs.length + ' imágenes encontradas', 'info');
            processImages2(res.data.image_jobs, 0);
        });
    });

    $('#sav-stop-phase-2').on('click', function() {
        phase2Running = false;
        $('#sav-start-phase-2').show();
        $('#sav-stop-phase-2').hide();
    });

    function processImages2(jobs, index) {
        if (!phase2Running || index >= jobs.length) {
            logPhase2('Completado', 'success');
            phase2Running = false;
            $('#sav-start-phase-2').show();
            $('#sav-stop-phase-2').hide();
            return;
        }

        var progress = Math.round(((index + 1) / jobs.length) * 100);
        $('#sav-phase-2-bar').css('width', progress + '%');
        $('#sav-phase-2-percentage').text(progress + '%');

        $.post(sav_ajax.ajax_url, {
            action: 'sav_process_single_image',
            job: JSON.stringify(jobs[index]),
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            logPhase2(res.data.message, res.success ? 'success' : 'error');
        }).always(function() {
            setTimeout(function() {
                processImages2(jobs, index + 1);
            }, 2000);
        });
    }

    function logPhase2(msg, type) {
        var colors = {info: '#9cdcfe', success: '#4ec9b0', error: '#f48771'};
        var time = new Date().toLocaleTimeString();
        $('#sav-phase-2-log').append('<div style="color:' + colors[type] + '">[' + time + '] ' + msg + '</div>');
        $('#sav-phase-2-log').scrollTop($('#sav-phase-2-log')[0].scrollHeight);
    }

    // HERRAMIENTAS
    $('#sav-refresh-cron-log').on('click', function() {
        $('#sav-cron-log-content').html('Cargando...');
        $.post(sav_ajax.ajax_url, {
            action: 'sav_get_server_log',
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            $('#sav-cron-log-content').text(res.data.log);
        });
    }).trigger('click');

    $('#sav-reset-timestamps').on('click', function() {
        if (!confirm('¿Resetear timestamps?')) return;
        $.post(sav_ajax.ajax_url, {
            action: 'sav_reset_timestamps',
            _ajax_nonce: sav_ajax.nonce
        }).done(function(res) {
            alert(res.data.message);
        });
    });
});