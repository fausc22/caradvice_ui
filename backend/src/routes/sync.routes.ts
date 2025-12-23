import { Router } from 'express';
import { SyncController } from '../controllers/sync.controller';

const router = Router();

/**
 * POST /sync/inicial
 * Carga inicial completa de todos los autos desde ASOFIX
 */
router.post('/inicial', SyncController.syncInicial);

/**
 * POST /sync/cron
 * Sincronización incremental (para uso del cron job)
 */
router.post('/cron', SyncController.syncCron);

export default router;

