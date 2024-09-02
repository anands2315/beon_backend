const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    sectionTitle: {
        type: String,
        required: true,
    },
    sectionDescription: {
        type: String,
        required: true,
    },
    sectionImage: {
        data: Buffer,
        contentType: String,
    },
}, {
    _id: false, // Prevents Mongoose from creating an _id for each section
});

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    mainImage: {
        data: Buffer,
        contentType: String,
    },
    sections: [sectionSchema], // Array of section schemas
}, {
    timestamps: { createdAt: true, updatedAt: false },
});

blogSchema.virtual('mainImagePath').get(function () {
    return this.mainImage
        ? `data:${this.mainImage.contentType};base64,${this.mainImage.data.toString('base64')}`
        : null;
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;
