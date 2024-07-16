const mongoose = require('mongoose');

const exporterSchema = new mongoose.Schema({
    exporterName: { type: String, required: true },
    count: { type: Number, required: true },
});

const countrySchema = new mongoose.Schema({
    countryOfDestination: { type: String, required: true },
    count: { type: Number, required: true },
});

const portSchema = new mongoose.Schema({
    portOfDischarge: { type: String, required: true },
    count: { type: Number, required: true },
});

const topExporterSchema = new mongoose.Schema({
    topExporters: [exporterSchema],
    topCountries: [countrySchema],
    topPorts: [portSchema],
});

module.exports = mongoose.model('TopSchema', topExporterSchema);
