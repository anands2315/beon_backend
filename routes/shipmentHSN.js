const express = require('express');
const shipmentHSNRouter = express.Router();
const ShipmentHSN = require('../models/shipmentHSN'); // Ensure the path is correct
const auth = require('../middleware/auth');

// Get all ShipmentHSN data
shipmentHSNRouter.get('/api/shipmenthsn', auth, async (req, res) => {

    try {
        const shipmentHSNs = await ShipmentHSN.find().lean();
        res.json(shipmentHSNs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


shipmentHSNRouter.get('/api/shipmenthsn/:ritcCode', auth, async (req, res) => {
    try {
        const shipmentHSN = await ShipmentHSN.find({ ritcCode: req.params.ritcCode }).lean();
        if (!shipmentHSN) return res.status(404).json({ error: 'ShipmentHSN not found' });
        res.json(shipmentHSN);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new ShipmentHSN entry
shipmentHSNRouter.post('/api/shipmenthsn', auth, async (req, res) => {
    try {
        const newShipmentHSN = new ShipmentHSN(req.body);
        await newShipmentHSN.save();
        res.status(201).json(newShipmentHSN);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Update an existing ShipmentHSN entry
shipmentHSNRouter.put('/api/shipmenthsn/:id', auth, async (req, res) => {
    try {
        const updatedShipmentHSN = await ShipmentHSN.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedShipmentHSN) return res.status(404).json({ error: 'ShipmentHSN not found' });
        res.json(updatedShipmentHSN);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a ShipmentHSN entry
shipmentHSNRouter.delete('/api/shipmenthsn/:id', auth, async (req, res) => {
    try {
        const deletedShipmentHSN = await ShipmentHSN.findByIdAndDelete(req.params.id);
        if (!deletedShipmentHSN) return res.status(404).json({ error: 'ShipmentHSN not found' });
        res.json({ message: 'ShipmentHSN deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = shipmentHSNRouter;
