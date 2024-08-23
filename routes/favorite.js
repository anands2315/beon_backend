const express = require('express');
const Favorite = require('../models/favorite');
const auth = require('../middleware/auth');
const router = express.Router();

// Add an entry to the favorites list
router.post('/api/favorites', auth,async (req, res) => {
    const { userId, entryId } = req.body;
    try {
        let favorite = await Favorite.findOne({ userId });
        if (!favorite) {
            favorite = new Favorite({ userId, entryIds: [entryId] });
        } else {
            if (!favorite.entryIds.includes(entryId)) {
                favorite.entryIds.push(entryId);
            }
        }
        await favorite.save();
        res.status(201).json(favorite);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all favorites of a user
router.get('/api/favorites/:userId', auth,async (req, res) => {
    const { userId } = req.params;
    try {
        const favorite = await Favorite.findOne({ userId });
        if (favorite) {
            res.status(200).json(favorite.entryIds);
        } else {
            res.status(200).json([]); // Return an empty array instead of an error
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Check if an entry is favorited
router.get('/api/favorites/:userId/:entryId', auth,async (req, res) => {
    const { userId, entryId } = req.params;
    try {
        const favorite = await Favorite.findOne({ userId });
        if (favorite && favorite.entryIds.includes(entryId)) {
            res.status(200).json({ favorited: true });
        } else {
            res.status(200).json({ favorited: false });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Remove an entry from the favorites list
router.delete('/api/favorites/:userId/:entryId', auth,async (req, res) => {
    const { userId, entryId } = req.params;
    try {
        // Find the favorite document for the user
        const favorite = await Favorite.findOne({ userId });

        // If favorite document is found, remove entryId from entryIds array
        if (favorite) {
            favorite.entryIds = favorite.entryIds.filter(id => id !== entryId);
            await favorite.save();
            res.status(204).end();
        } else {
            res.status(404).json({ error: 'Favorites not found for this user' });
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
