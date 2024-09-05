const express = require('express');
const issueRouter = express.Router();
const Issue = require('../models/issue');
const multer = require('multer');
const auth = require('../middleware/auth');
const crypto = require('crypto');

const storage = multer.memoryStorage();
const upload = multer({ storage });

function generateTicketNumber() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
}

// Create a new issue
issueRouter.post('/api/issue', auth, upload.array('images'), async (req, res) => {
    try {
        const { name, issue, resolved, comment } = req.body;
        const images = req.files ? req.files.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        })) : [];

        if (!name || !issue) {
            return res.status(400).send({ error: 'Name and issue are required' });
        }

        let ticketNumber;
        let ticketExists;
        do {
            ticketNumber = generateTicketNumber();
            ticketExists = await Issue.findOne({ ticketNumber });
        } while (ticketExists);

        const newIssue = new Issue({
            name,
            issue,
            resolved: resolved || false,
            comment: comment || '',
            ticketNumber,
            images
        });

        await newIssue.save();
        res.status(201).send(newIssue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get all issues
issueRouter.get('/api/issue', auth, async (req, res) => {
    try {
        const issues = await Issue.find().lean();
        const formattedIssues = issues.map(issue => ({
            ...issue,
            images: issue.images.map(image => ({
                ...image,
                data: image.data.toString('base64')
            }))
        }));
        res.status(200).send(formattedIssues);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// Get a single issue by ID
issueRouter.get('/api/issue/:id', auth, async (req, res) => {
    try {
        const issue = await Issue.findById(req.params.id).lean();

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        const formattedIssue = {
            ...issue._doc, 
            images: issue.images.map(image => ({
                ...image,
                data: image.data.toString('base64')
            }))
        };

        res.status(200).send(formattedIssue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Update an issue by ID
issueRouter.patch('/api/issue/:id', auth, upload.array('images'), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'issue', 'resolved', 'comment'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        // Apply text updates
        updates.forEach((update) => {
            if (update !== 'images') {
                issue[update] = req.body[update];
            }
        });

        // Handle image updates
        if (req.files && req.files.length > 0) {
            // Replace the existing images with the new ones
            issue.images = req.files.map(file => ({
                data: file.buffer,
                contentType: file.mimetype
            }));
        }

        await issue.save();
        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});




// Delete an issue by ID
issueRouter.delete('/api/issue/:id', auth, async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id); y

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = issueRouter;
