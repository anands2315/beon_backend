const mongoose = require('mongoose');

const shipmentPODSchema = new mongoose.Schema({
    pod: { type: String, required: true },
    monthWiseShipments: [
        {
            month: { type: String, required: true },
            count: { type: Number, required: true }
        }
    ],
    chapterCodeCounts: {
        type: Map,
        of: {
            type: Map,
            of: Number
        }
    },
    fetchedData: { type: Number, required: true },
    topExportContinents: [
        {
            continent: { type: String, required: true },
            count: { type: Number, required: true },
            percentage: { type: Number, required: true }
        }
    ]
});

const ShipmentPOD = mongoose.model('ShipmentPOD', shipmentPODSchema);

module.exports = ShipmentPOD;
