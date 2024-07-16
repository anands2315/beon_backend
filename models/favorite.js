const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
    },
    entryIds: {
        type: [String],
        default: [],
    },
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;