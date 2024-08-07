// routes/issues.js
const express = require('express');
const issueRouter = express.Router();
const Issue = require('../models/issue');

// Create a new issue
issueRouter.post('/api/issue', async (req, res) => {
    try {
        const { name, issue, resolved } = req.body;

        if (!name || !issue) {
            return res.status(400).send({ error: 'Name and issue are required' });
        }

        const newIssue = new Issue({
            name,
            issue,
            resolved: resolved || false,
        });

        await newIssue.save();
        res.status(201).send(newIssue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get all issues
issueRouter.get('/api/issue', async (req, res) => {
    try {
        const issues = await Issue.find();
        res.status(200).send(issues);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get a single issue by ID
issueRouter.get('/api/issue/:id', async (req, res) => {
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
    const allowedUpdates = ['name', 'issue', 'resolved'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const issue = await Issue.findById(req.params.id);

        if (!issue) {
            return res.status(404).send({ error: 'Issue not found' });
        }

        updates.forEach((update) => issue[update] = req.body[update]);
        await issue.save();

        res.status(200).send(issue);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Delete an issue by ID
issueRouter.delete('/api/issue/:id', async (req, res) => {
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
