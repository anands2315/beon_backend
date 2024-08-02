const mongoose = require('mongoose');

const shipmentPODSchema = new mongoose.Schema({
    pod: { type: String, required: true },
    chapterCodes: [
        {
            chapterCode: { type: String, required: true },
            shipmentsByMonth: [
                {
                    monthYear: { type: String, required: true },
                    shipmentCount: { type: Number, required: true }
                }
            ],
            totalShipments: { type: Number, required: true }
        }
    ],
    totalShipments: { type: Number, required: true },
    fetchedData: { type: Number, required: true },
    topExportContinents: [
        {
            continent: { type: String, required: true },
            count: { type: Number, required: true },
            percentage: { type: Number, required: true },
        },
    ],
});

const ShipmentPOD = mongoose.model('ShipmentPOD', shipmentPODSchema);

module.exports = ShipmentPOD;