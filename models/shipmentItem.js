const mongoose = require('mongoose');

const shipmentItemSchema = new mongoose.Schema({
    itemDesc: { type: String, required: true },  // Using itemDesc instead of exporterName
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

const ShipmentItem = mongoose.model('ShipmentItem', shipmentItemSchema);

module.exports = ShipmentItem;
