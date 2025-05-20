const express = require('express');
const router = express.Router();

// Process payment
router.post('/', async (req, res) => {
    const { cardName, cardNumber, expiryDate, cvv } = req.body;

    // Dummy payment validation
    if (cardName === "Thivi" && cardNumber === "1234567812345678" && expiryDate === "12/25" && cvv === "123") {
        res.json({ message: 'Payment successful.' });
    } else {
        res.status(400).json({ message: 'Invalid payment details.' });
    }
});

module.exports = router;