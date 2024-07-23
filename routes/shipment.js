const express = require("express");
const Shipment = require("../models/shipment");
const shipmentRouter = express.Router();


shipmentRouter.post('/api/shipments', (req, res) => {
    const { country, monthWiseShipments, fetchedData, topExportPODs } = req.body;

    Shipment.findOne({ country })
        .then(existingShipment => {
            if (existingShipment) {
                return res.status(400).send({ error: 'Data for this country already exists.' });
            }

            const newShipment = new Shipment({
                country,
                monthWiseShipments,
                fetchedData,
                topExportPODs,
            });

            return newShipment.save();
        })
        .then(doc => {
            if (doc) {
                res.status(201).send(doc);
            }
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

shipmentRouter.get('/api/shipments', (req, res) => {

    Shipment.find({})
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

shipmentRouter.get('/api/shipments/:country', (req, res) => {
    const country = req.params.country;

    Shipment.find({ country: { $regex: country, $options: "i" } })
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

module.exports = shipmentRouter;