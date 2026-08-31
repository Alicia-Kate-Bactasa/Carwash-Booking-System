const express = require('express');
const router = express.Router();
const prisma = require('../config/db');

/**
 * GET /api/v1/services
 * Get list of available services (Optionally include inactive services with ?include_inactive=true)
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
 * Create a new detailing service package (Admin)
 */
router.post('/', async (req, res) => {
  try {
    const { service_name, service_price, service_category, service_duration, service_description, is_active } = req.body;

    if (!service_name || service_price === undefined) {
      return res.status(400).json({ status: 'error', message: 'Service name and price are required.' });
    }

    const durationMins = parseInt(service_duration, 10) || 60;
    const priceVal = parseFloat(service_price) || 0;

    const newService = await prisma.service.create({
      data: {
        service_name: service_name.trim(),
        service_price: priceVal,
        service_category: service_category ? service_category.trim() : 'Detailing',
        service_duration: durationMins,
        service_description: service_description ? service_description.trim() : '',
        is_active: is_active ?? true,
        last_updated_by: 'Admin'
      }
    });

    return res.status(201).json({
      status: 'success',
      message: 'New detailing service package added successfully.',
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
 * Update an existing service (Admin)
 */
router.put('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    if (isNaN(serviceId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid service ID.' });
    }

    const { service_name, service_price, service_category, service_duration, service_description, is_active } = req.body;

    const updateData = {};
    if (service_name !== undefined) updateData.service_name = service_name.trim();
    if (service_price !== undefined) updateData.service_price = parseFloat(service_price);
    if (service_category !== undefined) updateData.service_category = service_category.trim();
    if (service_duration !== undefined) updateData.service_duration = parseInt(service_duration, 10);
    if (service_description !== undefined) updateData.service_description = service_description.trim();
    if (is_active !== undefined) updateData.is_active = Boolean(is_active);
    updateData.last_updated_by = 'Admin';

    const updatedService = await prisma.service.update({
      where: { service_id: serviceId },
      data: updateData
    });

    return res.status(200).json({
      status: 'success',
      message: 'Service package updated successfully.',
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
 * PATCH /api/v1/services/:id/toggle
 * Toggle service activation status (Admin)
 */
router.patch('/:id/toggle', async (req, res) => {
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

    const updatedService = await prisma.service.update({
      where: { service_id: serviceId },
      data: {
        is_active: !service.is_active,
        last_updated_by: 'Admin'
      }
    });

    return res.status(200).json({
      status: 'success',
      message: `Service package ${updatedService.is_active ? 'activated' : 'deactivated'} successfully.`,
      data: updatedService
    });
  } catch (error) {
    console.error('Error toggling service status:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update service status.'
    });
  }
});

/**
 * DELETE /api/v1/services/:id
 * Soft delete / deactivate service (Admin)
 */
router.delete('/:id', async (req, res) => {
  try {
    const serviceId = parseInt(req.params.id, 10);
    if (isNaN(serviceId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid service ID.' });
    }

    const deactivatedService = await prisma.service.update({
      where: { service_id: serviceId },
      data: {
        is_active: false,
        last_updated_by: 'Admin'
      }
    });

    return res.status(200).json({
      status: 'success',
      message: 'Service package deactivated successfully.',
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
