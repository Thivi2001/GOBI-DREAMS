const Service = require('./Service');
const Booking = require('./Booking');

// Define associations
Service.hasMany(Booking, { foreignKey: 'serviceId' });
Booking.belongsTo(Service, { foreignKey: 'serviceId' });

// Export models
module.exports = {
  Service,
  Booking,
};