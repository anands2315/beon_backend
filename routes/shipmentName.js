const express = require('express');
const ShipmentName = require('../models/shipmentName');
const auth = require('../middleware/auth');
const shipmentNameRouter = express.Router();

// Calculate fetchedData (total shipment count)
const calculateFetchedData = (monthWiseShipments) => {
    return monthWiseShipments.reduce((total, shipment) => total + shipment.count, 0);
};

// POST endpoint to add new shipment data
shipmentNameRouter.post('/api/shipmentName', auth, (req, res) => {
    const { exporterName, monthWiseShipments, topExportContinents } = req.body;
    const fetchedData = calculateFetchedData(monthWiseShipments);

    ShipmentName.findOne({ exporterName })
        .then(existingShipment => {
            if (existingShipment) {
                return res.status(400).send({ error: 'Data for this exporter name already exists.' });
            }

            const newShipment = new ShipmentName({
                exporterName,
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
shipmentNameRouter.get('/api/shipmentName', auth, (req, res) => {
    ShipmentName.find({}).lean()
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// GET endpoint to retrieve shipment data by exporterName
shipmentNameRouter.get('/api/shipmentName/:exporterName', auth, (req, res) => {
    const exporterName = req.params.exporterName;

    ShipmentName.findOne({ exporterName }).lean()
        .then(doc => {
            if (!doc) {
                return res.status(404).send({ error: 'Shipment data not found.' });
            }
            res.status(200).send(doc);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// PUT endpoint to update shipment data by exporterName
shipmentNameRouter.put('/api/shipmentName/:exporterName', auth, (req, res) => {
    const exporterName = req.params.exporterName;
    const { monthWiseShipments, topExportContinents } = req.body;
    const fetchedData = calculateFetchedData(monthWiseShipments);

    ShipmentName.findOneAndUpdate(
        { exporterName },
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

// DELETE endpoint to remove shipment data by exporterName
shipmentNameRouter.delete('/api/shipmentName/:exporterName', auth, (req, res) => {
    const exporterName = req.params.exporterName;

    ShipmentName.findOneAndDelete({ exporterName })
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

module.exports = shipmentNameRouter;
