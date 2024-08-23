const express = require('express');
const auth = require('../middleware/auth');
const User = require('../models/user');
const RecentSearch = require('../models/recentSearch');

const recentSearchRouter = express.Router();

recentSearchRouter.post('/api/recent-search', auth, async (req, res) => {
    try {
        const { search } = req.body;
        let user = await User.findById(req.user);

        if (!search) {
            return res.status(400).json({ message: 'Search query is required' });
        }

        // Check if the search already exists for the user
        let existingSearch = await RecentSearch.findOne({
            userId: user._id,
            search: search
        });

        if (existingSearch) {
            // If it exists, update the createdAt timestamp
            existingSearch.createdAt = Date.now();
            await existingSearch.save();
            return res.status(200).json({ message: 'Search updated' });
        }

        // If not, create a new recent search entry
        const recentSearch = new RecentSearch({
            userId: user._id,
            search,
        });

        await recentSearch.save();

        // Limit to 10 recent searches: if the user has more than 10, remove the oldest one
        const recentSearchCount = await RecentSearch.countDocuments({ userId: user._id });

        if (recentSearchCount > 10) {
            const oldestSearch = await RecentSearch.findOne({ userId: user._id }).sort({ createdAt: 1 });
            if (oldestSearch) {
                await RecentSearch.deleteOne({ _id: oldestSearch._id }); // Corrected line
            }
        }

        res.status(200).json({ message: 'Search saved' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


recentSearchRouter.get('/api/recent-searches', auth, async (req, res) => {
    try {
        let user = await User.findById(req.user);

        const recentSearches = await RecentSearch.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(10); // Limiting to the last 10 searches

        res.status(200).json(recentSearches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = recentSearchRouter;