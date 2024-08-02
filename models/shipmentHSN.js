const mongoose = require('mongoose');

const shipmentHSNSchema = new mongoose.Schema({
    ritcCode: { type: Number, required: true },
    fetchedData: { type: Number, required: true },
    monthWiseShipments: [
        {
            month: { type: String, required: true },
            count: { type: Number, required: true }
        }
    ],
    topExportContinents: [
        {
            continent: { type: String, required: true },
            count: { type: Number, required: true },
            percentage: { type: Number, required: true },
            topContributors: [
                {
                    country: { type: String, required: true },
                    count: { type: Number, required: true },
                }
            ]
        }
    ]
});

const ShipmentHSN = mongoose.model('ShipmentHSN', shipmentHSNSchema);

module.exports = ShipmentHSN;
