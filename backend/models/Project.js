const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize.define('Project', {
    name: { type: DataTypes.STRING, allowNull: false },
    user: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.TEXT('long'), allowNull: false }, // Base64 string
    rating: { type: DataTypes.FLOAT, defaultValue: 0 },
    numberOfRatings: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = Project;