const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Photographer = require('../models/Photographer'); // Sequelize Photographer model
const router = express.Router();


// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save uploaded files temporarily
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});

const upload = multer({ storage });

// Get all photographers
router.get('/', async (req, res) => {
    try {
        const photographers = await Photographer.findAll();
        res.json(photographers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching photographers.', error });
    }
});

// Add a new photographer
router.post('/', upload.single('image'), async (req, res) => {
    const { name,description } = req.body;

    if (!name || !req.file ||!description) {
        return res.status(400).json({ message: 'Name, description and image are required.' });
    }

    try {
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

        const photographer = await Photographer.create({ name, image: imageBase64,description });
        fs.unlinkSync(imagePath);

        res.status(201).json({ message: 'Photographer added successfully.', photographer });
    } catch (error) {
        res.status(500).json({ message: 'Error adding photographer.', error });
    }
});

// Edit photographer (update name)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    let { name,description } = req.body;

    
    try {
        let photographer = await Photographer.findByPk(id);
        if (!photographer) {
            return res.status(404).json({ message: 'Photographer not found.' });
        }

        if(!name || name.trim()===''){	
            name = photographer.name;
        }

        if(!description || description.trim()===''){
            description = photographer.description;
        }

        photographer.name = name;
        photographer.description = description;
        await photographer.save();

        res.json({ message: 'Photographer updated successfully.', photographer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating photographer.', error });
    }
});

// Delete photographer
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const photographer = await Photographer.findByPk(id);
        if (!photographer) {
            return res.status(404).json({ message: 'Photographer not found.' });
        }

        await photographer.destroy();
        res.json({ message: 'Photographer deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting photographer.', error });
    }
});

router.get('/unbooked', async (req, res) => {
    try {
        // Assuming Booking model is available
        const Booking = require('../models/Booking');
        const bookedPhotographerIds = await Booking.findAll({
            attributes: ['photographerId'],
            group: ['photographerId'],
            raw: true,
        });

        const bookedIds = bookedPhotographerIds.map(b => b.photographerId);

        const unbookedPhotographers = await Photographer.findAll({
            where: {
                id: {
                    [require('sequelize').Op.notIn]: bookedIds.length ? bookedIds : [0],
                },
            },
        });

        res.json(unbookedPhotographers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching unbooked photographers.', error });
    }
});


module.exports = router;