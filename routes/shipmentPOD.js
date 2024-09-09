const express = require("express");
const ShipmentPOD = require("../models/shipmentPOD");
const auth = require("../middleware/auth");
const shipmentPODRouter = express.Router();

// POST endpoint to add new shipment data
shipmentPODRouter.post('/api/shipmentPOD', auth, (req, res) => {
    const { pod, monthWiseShipments, chapterCodeCounts, fetchedData, topExportContinents } = req.body;

    ShipmentPOD.findOne({ pod })
        .then(existingShipment => {
            if (existingShipment) {
                return res.status(400).send({ error: 'Data for this POD already exists.' });
            }

            const newShipment = new ShipmentPOD({
                pod,
                monthWiseShipments,
                chapterCodeCounts,
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
shipmentPODRouter.get('/api/shipmentPOD', auth, (req, res) => {
    ShipmentPOD.find({}).lean()
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// GET endpoint to retrieve shipment data by POD
shipmentPODRouter.get('/api/shipmentPOD/:pod', auth, (req, res) => {
    const pod = req.params.pod;

    ShipmentPOD.find({ pod }).lean()
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// PUT endpoint to update shipment data by POD
shipmentPODRouter.put('/api/shipmentPOD/:pod', auth, (req, res) => {
    const pod = req.params.pod;
    const { monthWiseShipments, chapterCodeCounts, fetchedData, topExportContinents } = req.body;

    ShipmentPOD.findOneAndUpdate(
        { pod },
        { monthWiseShipments, chapterCodeCounts, fetchedData, topExportContinents },
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
shipmentPODRouter.delete('/api/shipmentPOD/:pod', auth, (req, res) => {
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
