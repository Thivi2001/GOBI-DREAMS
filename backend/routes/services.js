const express = require('express');
const router = express.Router();

// Mock data for services
const services = [
  { id: 1, name: "Wedding Photography", description: "Capture your special day.", price: 1000 },
  { id: 2, name: "Pre-Wedding Shoot", description: "Memorable pre-wedding moments.", price: 800 },
  { id: 3, name: "Reception Photography", description: "Cherish your reception memories.", price: 900 },
  { id: 4, name: "Birthday Photography", description: "Celebrate your birthday moments.", price: 500 },
  { id: 5, name: "Out-Door Photography", description: "Capture outdoor adventures.", price: 700 },
  { id: 6, name: "Puberty Ceremony Photography", description: "Special moments of growth.", price: 600 },
  { id: 7, name: "Casual Photography", description: "Everyday moments captured.", price: 400 },
  { id: 8, name: "Wild-Life Photography", description: "Explore the wild through photos.", price: 1200 },
];

// Get all services
router.get('/', (req, res) => {
  res.json(services);
});

module.exports = router;