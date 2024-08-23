const express = require('express');
const issueRouter = express.Router();
const Issue = require('../models/issue');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage(); // Store file in memory
const upload = multer({ storage });


// Create a new issue
issueRouter.post('/api/issue', auth, upload.array('images'), async (req, res) => {
    try {
        const { name, issue, resolved } = req.body;
        const images = req.files ? req.files.map(file => ({
            data: file.buffer,
            contentType: file.mimetype
        })) : [];

        if (!name || !issue) {
            return res.status(400).send({ error: 'Name and issue are required' });
        }

        const newIssue = new Issue({
            name,
            issue,
            resolved: resolved || false,
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
        const issues = await Issue.find();
        const formattedIssues = issues.map(issue => ({
            ...issue._doc,
            images: issue.images.map(image => ({
                ...image,
                data: image.data.toString('base64') // Convert image data to base64
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
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Update an issue by ID
issueRouter.patch('/api/issue/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'issue', 'resolved', 'images'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        updates.forEach((update) => {
            if (update === 'images') {
                issue[update] = req.body[update].map(img => ({
                    data: Buffer.from(img.data, 'base64'),
                    contentType: img.contentType
                }));
            } else {
                issue[update] = req.body[update];
            }
        });
        await issue.save();

        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete an issue by ID
issueRouter.delete('/api/issue/:id', auth, async (req, res) => {
    try {
        const issue = await Issue.findByIdAndDelete(req.params.id);

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = issueRouter;
