const express = require("express");
const Shipment = require("../models/shipment");
const auth = require("../middleware/auth");
const shipmentRouter = express.Router();

// Route to create or update shipment data
shipmentRouter.post('/api/shipments', auth, async (req, res) => {
    const { country, monthWiseShipments, fetchedData, topExportPODs, chapterCodeCounts } = req.body;

    try {
        const existingShipment = await Shipment.findOne({ country });

        if (existingShipment) {
            // If shipment data already exists, return a message
            return res.status(400).send({ message: 'Data for this country already exists.', data: existingShipment });
        } else {
            // Create new shipment
            const newShipment = new Shipment({
                country,
                monthWiseShipments,
                fetchedData,
                topExportPODs,
                chapterCodeCounts
            });
            const savedShipment = await newShipment.save();
            return res.status(201).send(savedShipment);
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Route to get all shipment data
shipmentRouter.get('/api/shipments', auth, async (req, res) => {
    try {
        const shipments = await Shipment.find({});
        res.status(200).send(shipments);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

// Route to get shipment data for a specific country
shipmentRouter.get('/api/shipments/:country', auth, async (req, res) => {
    const country = req.params.country;

    try {
        const shipment = await Shipment.findOne({ country: { $regex: country, $options: "i" } });
        if (shipment) {
            res.status(200).send(shipment);
        } else {
            res.status(404).send({ message: 'Shipment data not found for the specified country.' });
        }
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

module.exports = shipmentRouter;
