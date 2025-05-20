const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/db'); // Database connection
require('dotenv').config();

const User = require('./models/User');
const Project = require('./models/Project');
const Service = require('./models/Service');
const Photographer = require('./models/Photographer');
const Booking = require('./models/Booking');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use(express.json()); // <-- Add this line

// If you use forms, also add:
app.use(express.urlencoded({ extended: true }));

// Test database connection
sequelize
    .authenticate()
    .then(() => console.log('Database connected...'))
    .catch((err) => console.error('Error connecting to the database:', err));

// Sync models with the database
sequelize.sync({ alter: true })
    .then(() => console.log('Database synced successfully.'))
    .catch((err) => console.error('Error syncing database:', err));

// Import routes
const authRoutes = require('./routes/auth'); // Authentication routes
const projectRoutes = require('./routes/projects');
const serviceRoutes = require('./routes/services');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const photographersRoute = require('./routes/photographers');
const reportRoutes = require('./routes/report');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/photographers', photographersRoute);
app.use('/api/report', reportRoutes);

// Default route
app.get('/', (req, res) => {
    res.send('Welcome to the backend API!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});