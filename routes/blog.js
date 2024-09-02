const express = require('express');
const blogRouter = express.Router();
const Blog = require('../models/blog');
const multer = require('multer');
const auth = require('../middleware/auth');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Create a new blog
blogRouter.post('/api/blog', auth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'sectionImages', maxCount: 10 }
]), async (req, res) => {
    try {
        const { title, description, sections } = req.body;
        const mainImage = req.files['mainImage'] ? {
            data: req.files['mainImage'][0].buffer,
            contentType: req.files['mainImage'][0].mimetype
        } : null;

        const sectionImages = req.files['sectionImages'] || [];
        const formattedSections = JSON.parse(sections).map((section, index) => ({
            sectionTitle: section.sectionTitle,
            sectionDescription: section.sectionDescription,
            ...(sectionImages[index] && {
                sectionImage: {
                    data: sectionImages[index].buffer,
                    contentType: sectionImages[index].mimetype
                }
            })
        }));

        if (!title || !description || !sections) {
            return res.status(400).send({ error: 'Title, description, and sections are required' });
        }

        const newBlog = new Blog({
            title,
            description,
            mainImage,
            sections: formattedSections
        });

        await newBlog.save();
        res.status(201).send(newBlog);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// Get all blogs
blogRouter.get('/api/blog', async (req, res) => {
    try {
        const blogs = await Blog.find();
        const formattedBlogs = blogs.map(blog => ({
            ...blog._doc,
            mainImage: blog.mainImage ? `data:${blog.mainImage.contentType};base64,${blog.mainImage.data.toString('base64')}` : null,
            sections: blog.sections.map(section => ({
                ...section._doc,
                sectionImage: section.sectionImage && section.sectionImage.data ?
                    `data:${section.sectionImage.contentType};base64,${section.sectionImage.data.toString('base64')}` : null
            }))
        }));
        res.status(200).send(formattedBlogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

// Get a single blog by ID
blogRouter.get('/api/blog/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        const formattedBlog = {
            ...blog._doc,
            mainImage: blog.mainImage ? `data:${blog.mainImage.contentType};base64,${blog.mainImage.data.toString('base64')}` : null,
            sections: blog.sections.map(section => ({
                ...section._doc,
                sectionImage: section.sectionImage && section.sectionImage.data ?
                    `data:${section.sectionImage.contentType};base64,${section.sectionImage.data.toString('base64')}` : null
            }))
        };

        res.status(200).send(formattedBlog);
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// Update a blog by ID
blogRouter.patch('/api/blog/:id', auth, upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'sectionImages', maxCount: 10 }
]), async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'description', 'sections'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        updates.forEach(update => blog[update] = req.body[update]);

        if (req.files['mainImage']) {
            blog.mainImage = {
                data: req.files['mainImage'][0].buffer,
                contentType: req.files['mainImage'][0].mimetype
            };
        }

        if (req.files['sectionImages']) {
            const sectionImages = req.files['sectionImages'];
            const sections = JSON.parse(req.body.sections).map((section, index) => ({
                sectionTitle: section.sectionTitle,
                sectionDescription: section.sectionDescription,
                sectionImage: sectionImages[index] ? {
                    data: sectionImages[index].buffer,
                    contentType: sectionImages[index].mimetype
                } : blog.sections[index].sectionImage // Retain existing image if not updated
            }));

            blog.sections = sections;
        } else {
            // Handle case when no sectionImages are provided
            blog.sections = JSON.parse(req.body.sections).map((section, index) => ({
                sectionTitle: section.sectionTitle,
                sectionDescription: section.sectionDescription,
                sectionImage: blog.sections[index] ? blog.sections[index].sectionImage : null
            }));
        }

        await blog.save();
        res.status(200).send(blog);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});


// Delete a blog by ID
blogRouter.delete('/api/blog/:id', auth, async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).send({ error: 'Blog not found' });
        }

        res.status(200).send(blog);
    } catch (error) {
        res.status(500).send({ error: 'Internal Server Error' });
    }
});

module.exports = blogRouter;
