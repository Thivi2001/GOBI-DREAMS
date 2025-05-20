const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking'); // Sequelize Booking model
const Service = require('../models/Service'); // Sequelize Service model

// Create a new booking
router.post('/', async (req, res) => {
  const { serviceId, additionalServices, photographerId, totalAmount, bookingDate, status } = req.body;

  if (!serviceId || !totalAmount) {
    return res.status(400).json({ message: 'Service and total amount are required.' });
  }

  try {
    const booking = await Booking.create({
      serviceId,
      additionalServices: JSON.stringify(additionalServices),
      photographerId,
      totalAmount,
      bookingDate,
      status: status || 'Booked'
    });

    res.status(201).json({ message: 'Booking created successfully.', booking });
  } catch (error) {
    res.status(500).json({ message: 'Error creating booking.', error });
  }
});

// Get all bookings (basic)
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings.', error });
  }
});

// Get all bookings with service name (admin)
router.get('/admin', async (req, res) => {
  try {
    const bookings = await Booking.findAll({ include: [{ model: Service }] });
    res.json(bookings.map(b => ({
      id: b.id,
      serviceName: b.Service ? b.Service.name : '',
      bookingDate: b.bookingDate,
      totalAmount: b.totalAmount,
      photographerId: b.photographerId,
      additionalServices: b.additionalServices,
      status: b.status
    })));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching bookings.', error });
  }
});

// Update booking status (admin)
router.put('/:id/status', async (req, res) => {
  const { status } = req.body;
  try {
    await Booking.update({ status }, { where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status.', error });
  }
});

module.exports = router;