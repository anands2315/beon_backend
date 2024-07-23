const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    country: { type: String, required: true },
    monthWiseShipments: [
        {
            month: { type: String, required: true },
            count: { type: Number, required: true }
        }
    ],
    fetchedData: { type: Number, required: true },
    topExportPODs: [
        {
            pod: { type: String, required: true },
            count: { type: Number, required: true },
            percentage: { type: Number, required: true },
        },
    ],
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
