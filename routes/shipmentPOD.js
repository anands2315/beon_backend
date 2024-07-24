const express = require("express");
const ShipmentPOD = require("../models/shipmentPOD");
const shipmentPODRouter = express.Router();

// POST endpoint to add new shipment data
shipmentPODRouter.post('/api/shipmentPOD', (req, res) => {
    const { pod, monthWiseShipments, fetchedData, topExportContinents } = req.body;

    ShipmentPOD.findOne({ pod })
        .then(existingShipment => {
            if (existingShipment) {
                return res.status(400).send({ error: 'Data for this POD already exists.' });
            }

            const newShipment = new ShipmentPOD({
                pod,
                monthWiseShipments,
                fetchedData,
                topExportContinents,
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

// GET endpoint to retrieve all shipment data
shipmentPODRouter.get('/api/shipmentPOD', (req, res) => {
    ShipmentPOD.find({})
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// GET endpoint to retrieve shipment data by POD
shipmentPODRouter.get('/api/shipmentPOD/:pod', (req, res) => {
    const pod = req.params.pod;

    ShipmentPOD.find({ pod: { $regex: pod, $options: "i" } })
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// PUT endpoint to update shipment data by POD
shipmentPODRouter.put('/api/shipmentPOD/:pod', (req, res) => {
    const pod = req.params.pod;
    const { monthWiseShipments, fetchedData, topExportContinents } = req.body;

    ShipmentPOD.findOneAndUpdate(
        { pod },
        { monthWiseShipments, fetchedData, topExportContinents },
        { new: true, runValidators: true }
    )
        .then(updatedShipment => {
            if (!updatedShipment) {
                return res.status(404).send({ error: 'Shipment data not found.' });
            }
            res.status(200).send(updatedShipment);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// DELETE endpoint to remove shipment data by POD
shipmentPODRouter.delete('/api/shipmentPOD/:pod', (req, res) => {
    const pod = req.params.pod;

    ShipmentPOD.findOneAndDelete({ pod })
        .then(deletedShipment => {
            if (!deletedShipment) {
                return res.status(404).send({ error: 'Shipment data not found.' });
            }
            res.status(200).send({ message: 'Shipment data deleted successfully.' });
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

module.exports = shipmentPODRouter;
