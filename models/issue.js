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
    images: [{
        data: Buffer, // Store the image as binary data
        contentType: String // Store the image MIME type
    }],
}, {
    timestamps: true // This will add createdAt and updatedAt fields automatically
});

issueSchema.virtual('imagePaths').get(function() {
    return this.images.map(image => `data:${image.contentType};base64,${image.data.toString('base64')}`);
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
