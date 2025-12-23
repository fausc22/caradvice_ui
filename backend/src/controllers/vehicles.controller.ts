import { Request, Response } from 'express';
import pool from '../config/database';
import logger from '../services/logger';
import { VehicleFilters } from '../services/vehicle-filters';

/**
 * Controlador para endpoints de vehículos
 * Aplica automáticamente los filtros obligatorios en todos los endpoints públicos
 */
export class VehiclesController {
  /**
   * GET /autos
   * Obtiene vehículos con filtros aplicados
   * Filtros obligatorios aplicados automáticamente:
   * - No Dakota
   * - Precio > 1
   * - Estado != reservado
   * - Al menos una imagen
   */
  static async getVehicles(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const brand = req.query.brand ? String(req.query.brand).trim() : null;
      const model = req.query.model ? String(req.query.model).trim() : null;
      
      const parseNumericParam = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return (!isNaN(num) && isFinite(num) && num > 0) ? num : null;
      };
      
      const parseNumericParamWithZero = (value: any): number | null => {
        if (value === null || value === undefined || value === '') return null;
        const num = Number(value);
        return (!isNaN(num) && isFinite(num) && num >= 0) ? num : null;
      };
      
      const minPrice = parseNumericParam(req.query.minPrice);
      const maxPrice = parseNumericParam(req.query.maxPrice);
      const minYear = parseNumericParam(req.query.minYear);
      const maxYear = parseNumericParam(req.query.maxYear);
      const minKilometres = parseNumericParamWithZero(req.query.minKilometres);
      const maxKilometres = parseNumericParam(req.query.maxKilometres);
      
      const condition = req.query.condition ? String(req.query.condition).trim() : null;
      const transmission = req.query.transmission ? String(req.query.transmission).trim() : null;
      const fuel_type = req.query.fuel_type ? String(req.query.fuel_type).trim() : null;
      const color = req.query.color ? String(req.query.color).trim() : null;
      const segment = req.query.segment ? String(req.query.segment).trim() : null;
      const search = req.query.search ? String(req.query.search).trim() : null;
      const sortBy = String(req.query.sortBy || 'created_at');
      const sortOrder = String(req.query.sortOrder || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
      
      const currencyParam = req.query.currency ? String(req.query.currency).trim() : null;
      const currency = (currencyParam === 'USD' || currencyParam === 'ARS') ? currencyParam : null;
      
      const offset = (page - 1) * limit;
      
      // Construir condiciones WHERE
      const whereConditions: string[] = [];
      const whereParams: any[] = [];
      
      // FILTROS OBLIGATORIOS aplicados automáticamente
      // 1. Status = published (solo vehículos publicados)
      whereConditions.push('v.status = ?');
      whereParams.push('published');
      
      // 2. Precio > MIN_PRICE (por defecto > 1)
      const filterConfig = VehicleFilters.getFilterSummary();
      whereConditions.push('(v.price_usd > ? OR v.price_ars > ?)');
      whereParams.push(filterConfig.minPrice, filterConfig.minPrice);
      
      // 3. Debe tener al menos una imagen
      if (filterConfig.requireImages) {
        whereConditions.push('v.featured_image_id IS NOT NULL');
        whereConditions.push('EXISTS (SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id)');
      }
      
      // 4. Excluir concesionarias bloqueadas (Dakota por defecto)
      // Se verifica en el JSON additional_data.stock_info[].branch_office_name
      if (filterConfig.blockedBranchOffices.length > 0) {
        // Para cada concesionaria bloqueada, verificar que no esté en el JSON
        const blockedConditions = filterConfig.blockedBranchOffices.map(() => {
          return `(v.additional_data IS NULL OR v.additional_data NOT LIKE ?)`;
        });
        whereConditions.push(`(${blockedConditions.join(' AND ')})`);
        for (const blocked of filterConfig.blockedBranchOffices) {
          whereParams.push(`%${blocked.toLowerCase()}%`);
        }
      }
      
      // Filtros opcionales del usuario
      if (search && search.length > 0) {
        whereConditions.push('(v.title LIKE ? OR v.content LIKE ?)');
        const searchTerm = `%${search}%`;
        whereParams.push(searchTerm, searchTerm);
      }
      
      if (brand && brand.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'brand' AND tt.name = ?
        )`);
        whereParams.push(brand);
      }
      
      if (model && model.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'model' AND tt.name = ?
        )`);
        whereParams.push(model);
      }
      
      if (condition && condition.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'condition' AND tt.name = ?
        )`);
        whereParams.push(condition);
      }
      
      if (transmission && transmission.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'transmission' AND tt.name = ?
        )`);
        whereParams.push(transmission);
      }
      
      if (fuel_type && fuel_type.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'fuel_type' AND tt.name = ?
        )`);
        whereParams.push(fuel_type);
      }
      
      if (color && color.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'color' AND tt.name = ?
        )`);
        whereParams.push(color);
      }
      
      if (segment && segment.length > 0) {
        whereConditions.push(`EXISTS (
          SELECT 1 FROM vehicle_taxonomies vt 
          JOIN taxonomy_terms tt ON vt.term_id = tt.id 
          WHERE vt.vehicle_id = v.id AND tt.taxonomy = 'segment' AND tt.name = ?
        )`);
        whereParams.push(segment);
      }
      
      if (currency) {
        const priceField = currency === 'USD' ? 'v.price_usd' : 'v.price_ars';
        if (minPrice !== null) {
          whereConditions.push(`${priceField} >= ?`);
          whereParams.push(minPrice);
        }
        if (maxPrice !== null) {
          whereConditions.push(`${priceField} <= ?`);
          whereParams.push(maxPrice);
        }
      } else {
        if (minPrice !== null) {
          whereConditions.push('(v.price_usd >= ? OR v.price_ars >= ?)');
          whereParams.push(minPrice, minPrice);
        }
        if (maxPrice !== null) {
          whereConditions.push('(v.price_usd <= ? OR v.price_ars <= ?)');
          whereParams.push(maxPrice, maxPrice);
        }
      }
      
      if (minYear !== null) {
        whereConditions.push('v.year >= ?');
        whereParams.push(minYear);
      }
      
      if (maxYear !== null) {
        whereConditions.push('v.year <= ?');
        whereParams.push(maxYear);
      }
      
      if (minKilometres !== null) {
        whereConditions.push('v.kilometres >= ?');
        whereParams.push(minKilometres);
      }
      
      if (maxKilometres !== null) {
        whereConditions.push('v.kilometres <= ?');
        whereParams.push(maxKilometres);
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // ORDER BY
      let orderByField: string;
      if (sortBy === 'price') {
        if (currency === 'USD') {
          orderByField = 'v.price_usd';
        } else if (currency === 'ARS') {
          orderByField = 'v.price_ars';
        } else {
          orderByField = 'COALESCE(v.price_usd, v.price_ars, 0)';
        }
      } else {
        const sortFields: Record<string, string> = {
          'created_at': 'v.created_at',
          'year': 'v.year',
          'kilometres': 'v.kilometres',
          'title': 'v.title'
        };
        orderByField = sortFields[sortBy] || 'v.created_at';
      }
      
      const query = `SELECT DISTINCT
        v.id,
        v.asofix_id,
        v.title,
        v.content,
        v.year,
        v.kilometres,
        v.license_plate,
        v.price_usd,
        v.price_ars,
        v.created_at,
        v.updated_at,
        vi.file_path as featured_image_path,
        vi.image_url as featured_image_url
      FROM vehicles v
      LEFT JOIN vehicle_images vi ON v.featured_image_id = vi.id
      WHERE ${whereClause}
      ORDER BY ${orderByField} ${sortOrder}
      LIMIT ? OFFSET ?`;
      
      const finalParams = [...whereParams, parseInt(String(limit), 10), parseInt(String(offset), 10)];
      
      const [rows] = await pool.query<any[]>(query, finalParams);
      const vehicles = rows as any[];
      
      // Obtener taxonomías para cada vehículo
      for (const vehicle of vehicles) {
        const [taxonomies] = await pool.execute<any[]>(
          `SELECT tt.taxonomy, tt.name 
           FROM vehicle_taxonomies vt
           JOIN taxonomy_terms tt ON vt.term_id = tt.id
           WHERE vt.vehicle_id = ?`,
          [vehicle.id]
        );
        
        vehicle.taxonomies = taxonomies.reduce((acc: any, tax: any) => {
          if (!acc[tax.taxonomy]) acc[tax.taxonomy] = [];
          acc[tax.taxonomy].push(tax.name);
          return acc;
        }, {});
      }
      
      // Contar total con mismos filtros
      const countQuery = `SELECT COUNT(DISTINCT v.id) as total 
        FROM vehicles v
        WHERE ${whereClause}`;
      
      const [countResult] = await pool.execute<any[]>(countQuery, whereParams);
      const total = countResult[0]?.total || 0;
      
      res.json({
        success: true,
        data: {
          vehicles,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
          },
          filters_applied: VehicleFilters.getFilterSummary()
        }
      });
    } catch (error: any) {
      logger.error(`Error en GET /autos: ${error.message}`);
      logger.error(`Stack: ${error.stack}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * GET /autos/:id
   * Obtiene un vehículo por ID
   * Aplica los mismos filtros obligatorios
   */
  static async getVehicleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const filterConfig = VehicleFilters.getFilterSummary();
      
      // Construir condiciones WHERE con filtros obligatorios
      const whereConditions: string[] = ['v.id = ?'];
      const whereParams: any[] = [Number(id)];
      
      whereConditions.push('v.status = ?');
      whereParams.push('published');
      
      whereConditions.push('(v.price_usd > ? OR v.price_ars > ?)');
      whereParams.push(filterConfig.minPrice, filterConfig.minPrice);
      
      if (filterConfig.requireImages) {
        whereConditions.push('v.featured_image_id IS NOT NULL');
        whereConditions.push('EXISTS (SELECT 1 FROM vehicle_images vi WHERE vi.vehicle_id = v.id)');
      }
      
      if (filterConfig.blockedBranchOffices.length > 0) {
        const blockedConditions = filterConfig.blockedBranchOffices.map(() => {
          return `(v.additional_data IS NULL OR v.additional_data NOT LIKE ?)`;
        });
        whereConditions.push(`(${blockedConditions.join(' AND ')})`);
        for (const blocked of filterConfig.blockedBranchOffices) {
          whereParams.push(`%${blocked.toLowerCase()}%`);
        }
      }
      
      const whereClause = whereConditions.join(' AND ');
      
      // Aplicar filtros obligatorios en la consulta
      const [vehicles] = await pool.execute<any[]>(
        `SELECT v.*, 
          vi.file_path as featured_image_path,
          vi.image_url as featured_image_url
        FROM vehicles v
        LEFT JOIN vehicle_images vi ON v.featured_image_id = vi.id
        WHERE ${whereClause}`,
        whereParams
      );
      
      if (vehicles.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Vehículo no encontrado o no cumple con los filtros obligatorios' 
        });
      }
      
      // Verificar que tenga imágenes si es requerido
      if (filterConfig.requireImages) {
        const [imageCount] = await pool.execute<any[]>(
          'SELECT COUNT(*) as count FROM vehicle_images WHERE vehicle_id = ?',
          [Number(id)]
        );
        if (imageCount[0].count === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'Vehículo no encontrado (no tiene imágenes)' 
          });
        }
      }
      
      // Obtener imágenes
      const [images] = await pool.execute<any[]>(
        'SELECT image_url, file_path FROM vehicle_images WHERE vehicle_id = ? ORDER BY id',
        [Number(id)]
      );
      
      // Obtener taxonomías
      const [taxonomies] = await pool.execute<any[]>(
        `SELECT tt.taxonomy, tt.name 
         FROM vehicle_taxonomies vt
         JOIN taxonomy_terms tt ON vt.term_id = tt.id
         WHERE vt.vehicle_id = ?`,
        [Number(id)]
      );
      
      const vehicle = vehicles[0];
      vehicle.images = images;
      vehicle.taxonomies = taxonomies.reduce((acc: any, tax: any) => {
        if (!acc[tax.taxonomy]) acc[tax.taxonomy] = [];
        acc[tax.taxonomy].push(tax.name);
        return acc;
      }, {});
      
      res.json({ 
        success: true, 
        data: vehicle,
        filters_applied: filterConfig
      });
    } catch (error: any) {
      logger.error(`Error en GET /autos/:id: ${error.message}`);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

