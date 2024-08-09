const express = require('express');
const ShipmentItem = require('../models/shipmentItem');
const shipmentItemRouter = express.Router();

// Calculate fetchedData (total shipment count)
const calculateFetchedData = (monthWiseShipments) => {
    return monthWiseShipments.reduce((total, shipment) => total + shipment.count, 0);
};

// POST endpoint to add new shipment item
shipmentItemRouter.post('/api/shipmentItem', (req, res) => {
    const { itemDesc, monthWiseShipments, topExportContinents } = req.body;
    const fetchedData = calculateFetchedData(monthWiseShipments);

    ShipmentItem.findOne({ itemDesc })
        .then(existingShipment => {
            if (existingShipment) {
                return res.status(400).send({ error: 'Data for this item description already exists.' });
            }

            const newShipment = new ShipmentItem({
                itemDesc,
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

// GET endpoint to retrieve all shipment items
shipmentItemRouter.get('/api/shipmentItem', (req, res) => {
    ShipmentItem.find({})
        .then(docs => {
            res.status(200).send(docs);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// GET endpoint to retrieve shipment item by item description
shipmentItemRouter.get('/api/shipmentItem/:itemDesc', (req, res) => {
    const itemDesc = req.params.itemDesc;

    ShipmentItem.findOne({ itemDesc })
        .then(doc => {
            if (!doc) {
                return res.status(404).send({ error: 'Shipment item not found.' });
            }
            res.status(200).send(doc);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// PUT endpoint to update shipment item by item description
shipmentItemRouter.put('/api/shipmentItem/:itemDesc', (req, res) => {
    const itemDesc = req.params.itemDesc;
    const { monthWiseShipments, topExportContinents } = req.body;
    const fetchedData = calculateFetchedData(monthWiseShipments);

    ShipmentItem.findOneAndUpdate(
        { itemDesc },
        { monthWiseShipments, fetchedData, topExportContinents },
        { new: true, runValidators: true }
    )
        .then(updatedShipment => {
            if (!updatedShipment) {
                return res.status(404).send({ error: 'Shipment item not found.' });
            }
            res.status(200).send(updatedShipment);
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

// DELETE endpoint to remove shipment item by item description
shipmentItemRouter.delete('/api/shipmentItem/:itemDesc', (req, res) => {
    const itemDesc = req.params.itemDesc;

    ShipmentItem.findOneAndDelete({ itemDesc })
        .then(deletedShipment => {
            if (!deletedShipment) {
                return res.status(404).send({ error: 'Shipment item not found.' });
            }
            res.status(200).send({ message: 'Shipment item deleted successfully.' });
        })
        .catch(err => {
            res.status(500).send({ error: err.message });
        });
});

module.exports = shipmentItemRouter;
