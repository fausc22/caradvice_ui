import { Router } from 'express';
import { VehiclesController } from '../controllers/vehicles.controller';

const router = Router();

/**
 * GET /autos
 * Obtiene vehículos con filtros aplicados
 */
router.get('/', VehiclesController.getVehicles);

/**
 * GET /autos/:id
 * Obtiene un vehículo por ID
 */
router.get('/:id', VehiclesController.getVehicleById);

export default router;

