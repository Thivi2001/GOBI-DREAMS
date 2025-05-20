const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Project = require('../models/Project'); // Sequelize Project model
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.findAll();
        res.json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects.', error });
    }
});

// Add a new project
router.post('/', upload.single('image'), async (req, res) => {
    const { name, user } = req.body;

    if (!name || !user || !req.file) {
        return res.status(400).json({ message: 'Name, user, and image are required.' });
    }

    try {
        const imagePath = req.file.path;
        const imageBuffer = fs.readFileSync(imagePath);
        const imageBase64 = imageBuffer.toString('base64');

        const project = await Project.create({ name, user, image: imageBase64 });
        fs.unlinkSync(imagePath);

        res.status(201).json({ message: 'Project added successfully.', project });
    } catch (error) {
        res.status(500).json({ message: 'Error adding project.', error });
    }
});

// Edit a project
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, user, image } = req.body;

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        project.name = name || project.name;
        project.user = user || project.user;
        project.image = image || project.image;
        await project.save();

        res.json({ message: 'Project updated successfully.', project });
    } catch (error) {
        res.status(500).json({ message: 'Error updating project.', error });
    }
});

// Delete a project
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        await project.destroy();
        res.json({ message: 'Project deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting project.', error });
    }
});

// Submit feedback for a project
router.post('/:id/feedback', async (req, res) => {
    const { id } = req.params;
    const { rating, feedback } = req.body;

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        project.feedback = project.feedback || [];
        if (rating) project.rating = rating;
        if (feedback) project.feedback.push(feedback);

        await project.save();
        res.json({ message: 'Feedback submitted successfully.', project });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting feedback.', error });
    }
});

// Rate a project
router.post('/:id/rate', async (req, res) => {
    const { id } = req.params;
    const { rating } = req.body;

    try {
        const project = await Project.findByPk(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }
        project.numberOfRatings = (project.numberOfRatings || 0) + 1;
        project.rating=(project.rating || 0) * (project.numberOfRatings - 1);
        project.rating += rating;
        project.rating = (project.rating ) / project.numberOfRatings;
        project.rating = parseFloat(project.rating.toFixed(2)); // Round to 2 decimal places
        await project.save();

        res.json({ message: 'Rating submitted successfully.', project });
    } catch (error) {
        res.status(500).json({ message: 'Error rating project.', error });
    }
});

module.exports = router;