const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Photographer = sequelize.define('Photographer', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.TEXT('long'), allowNull: false }, // Base64 string
});

module.exports = Photographer;