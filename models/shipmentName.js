const mongoose = require('mongoose');

const shipmentNameSchema = new mongoose.Schema({
    exporterName: { type: String, required: true },
    monthWiseShipments: [
        {
            month: { type: String, required: true },
            count: { type: Number, required: true }
        }
    ],
    fetchedData: { type: Number, required: true },
    topExportContinents: [
        {
            continent: { type: String, required: true },
            count: { type: Number, required: true },
            percentage: { type: Number, required: true },
        },
    ],
});

const ShipmentName = mongoose.model('ShipmentName', shipmentNameSchema);

module.exports = ShipmentName;
