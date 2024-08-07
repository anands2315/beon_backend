const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    issue: {
        type: String,
        required: true,
    },
    resolved: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
