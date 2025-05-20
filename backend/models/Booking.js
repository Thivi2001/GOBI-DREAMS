const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Booking = sequelize.define('Booking', {
  serviceId: { type: DataTypes.INTEGER, allowNull: false },
  additionalServices: { type: DataTypes.INTEGER, allowNull: true }, // JSON string
  photographerId: { type: DataTypes.INTEGER, allowNull: true },
  totalAmount: { type: DataTypes.FLOAT, allowNull: false },
  bookingDate: { type: DataTypes.DATEONLY, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false, defaultValue: 'Booked' }
});

module.exports = Booking;