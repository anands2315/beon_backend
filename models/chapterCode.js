const mongoose = require('mongoose');

// Define the schema for ChapterCodeData
const chapterCodeSchema = new mongoose.Schema({
    chapterCode: {
        type: String,
        required: true
    },
    shipmentsByMonth: [
        {
            monthYear: {
                type: String,
                required: true
            },
            shipmentCount: {
                type: Number,
                required: true
            }
        }
    ],
    totalShipments: {
        type: Number,
        required: true
    }
});

// Create the model using the schema
const ChapterCodeData = mongoose.model('ChapterCodeData', chapterCodeSchema);

module.exports = ChapterCodeData;
