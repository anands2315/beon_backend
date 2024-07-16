// models/exportTest.js
const mongoose = require('mongoose');

const exportTestSchema = mongoose.Schema({
    sbNo: {
        type: Number,
        // require: true
    },
    sbDate: {
        type: String,
    },
    leoDate: {
        type: String,
    },
    iec: {
        type: String,
    },
    exporterName: {
        type: String,
    },
    consigneeName: {
        type: String,
    },
    countryOfDestination: {
        type: String,
    },
    portOfDischarge: {
        type: String,
    },
    currQueue: {
        type: String,
    },
    invoiceSerNo: {
        type: Number,
    },
    invoiceNo: {
        type: String,
    },
    itemNo: {
        type: Number,
    },
    ritcCode: {
        type: Number,
    },
    itemDesc: {
        type: String,
    },
    quantity: {
        type: Number,
    },
    uqc: {
        type: String,
    },
    itemRate: {
        type: Number,
    },
    currency: {
        type: String,
    },
    fob: {
        type: Number,
    },
    drawback: {
        type: Number,
    },
    challanNo: {
        type: String,
        default: 'N/A'
    }
});

const ExportTestData = mongoose.model("ExportTestData", exportTestSchema);

module.exports = ExportTestData;
