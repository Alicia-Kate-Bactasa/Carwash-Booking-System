const express = require('express');
const router = express.Router();
const prisma = require('../config/db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { z } = require('zod');

// Schema for service creation/update
const serviceSchema = z.object({
  body: z.object({
    service_name: z.string().min(2, 'Service name is required'),
    service_price: z.number().positive('Service price must be positive'),
    service_category: z.string().min(2, 'Service category is required'),
    service_duration: z.number().int().positive('Duration must be positive in minutes'),
    service_description: z.string().optional(),
    is_active: z.boolean().optional().default(true)
  })
});

/**
 * GET /api/v1/services
 * Get list of available services
 */
router.get('/', async (req, res) => {
  try {
    const { include_inactive } = req.query;
    const whereCondition = include_inactive === 'true' ? {} : { is_active: true };

    const services = await prisma.service.findMany({
      where: whereCondition,
      orderBy: { service_id: 'asc' }
    });

    return res.status(200).json({
      status: 'success',
      data: services
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve services catalog.'
    });
  }
});

/**
 * GET /api/v1/services/:id
 * Get single service details
 */
router.get('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    if (isNaN(serviceId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid service ID.' });
    }

    const service = await prisma.service.findUnique({
      where: { service_id: serviceId }
    });

    if (!service) {
      return res.status(404).json({ status: 'error', message: 'Service not found.' });
    }

    return res.status(200).json({
      status: 'success',
      data: service
    });
  } catch (error) {
    console.error('Error fetching service:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve service.'
    });
  }
});

/**
 * POST /api/v1/services
 * Create a new service (Admin required)
 */
router.post('/', requireAuth, requireAdmin, validate(serviceSchema), async (req, res) => {
  try {
    const { service_name, service_price, service_category, service_duration, service_description, is_active } = req.validated.body;

    const newService = await prisma.service.create({
      data: {
        service_name,
        service_price,
        service_category,
        service_duration,
        service_description: service_description || '',
        is_active: is_active ?? true,
        last_updated_by: req.user?.email || 'Admin'
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'Service created successfully.',
      data: newService
    });
  } catch (error) {
    console.error('Error creating service:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to create service.'
    });
  }
});

/**
 * PUT /api/v1/services/:id
 * Update an existing service (Admin required)
 */
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    if (isNaN(serviceId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid service ID.' });
    }

    const { service_name, service_price, service_category, service_duration, service_description, is_active } = req.body;

    const updatedService = await prisma.service.update({
      where: { service_id: serviceId },
      data: {
        ...(service_name && { service_name }),
        ...(service_price !== undefined && { service_price }),
        ...(service_category && { service_category }),
        ...(service_duration !== undefined && { service_duration }),
        ...(service_description !== undefined && { service_description }),
        ...(is_active !== undefined && { is_active }),
        last_updated_by: req.user?.email || 'Admin'
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Service updated successfully.',
      data: updatedService
    });
  } catch (error) {
    console.error('Error updating service:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update service.'
    });
  }
});

/**
 * DELETE /api/v1/services/:id
 * Deactivate a service (Admin required)
 */
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    if (isNaN(serviceId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid service ID.' });
    }

    // Soft delete / deactivate service
    const deactivatedService = await prisma.service.update({
      where: { service_id: serviceId },
      data: {
        is_active: false,
        last_updated_by: req.user?.email || 'Admin'
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Service deactivated successfully.',
      data: deactivatedService
    });
  } catch (error) {
    console.error('Error deactivating service:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to deactivate service.'
    });
  }
});

module.exports = router;
