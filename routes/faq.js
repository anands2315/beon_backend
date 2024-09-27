const express = require('express');
const FAQ = require("../models/faq");
const auth = require('../middleware/auth');
const faqRouter = express.Router();

// GET all FAQs
faqRouter.get('/api/faq', async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.json(faqs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET a single FAQ by ID
faqRouter.get('/api/faq/:id',auth, async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }
        res.json(faq);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST a new FAQ
faqRouter.post('/api/faq', auth,async (req, res) => {
    const faq = new FAQ({
        question: req.body.question,
        answer: req.body.answer
    });

    try {
        const newFAQ = await faq.save();
        res.status(201).json(newFAQ);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PUT (update) an existing FAQ
faqRouter.put('/api/faq/:id', auth,async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found' });
        }

        if (req.body.question != null) {
            faq.question = req.body.question;
        }
        if (req.body.answer != null) {
            faq.answer = req.body.answer;
        }

        const updatedFAQ = await faq.save();
        res.json(updatedFAQ);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// DELETE an FAQ
faqRouter.delete('/api/faq/:id', auth,async (req, res) => {
    try {
        const faq = await FAQ.findByIdAndDelete(req.params.id);

        res.json({ message: 'FAQ deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = faqRouter;
