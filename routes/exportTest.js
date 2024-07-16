const express = require('express');
const ExportTestData = require('../models/exportTest');
const exportTestRouter = express.Router();

exportTestRouter.post("/api/export-tests", async (req, res) => {
    console.log(req.body);
    try {
        let exportTestData = new ExportTestData(req.body);
        console.log(exportTestData);
        exportTestData = await exportTestData.save();
        res.json(exportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.get("/api/export-tests", async (req, res) => {
    try {
        const exportTestData = await ExportTestData.find({});
        res.json(exportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.get("/api/export-tests/by-name", async (req, res) => {
    try {
        const exportTestData = await ExportTestData.find({ exporterName: { $regex: req.query.exporterName, $options: "i" } });
        res.json(exportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.get("/api/export-tests/by-country", async (req, res) => {
    try {
        const exportTestData = await ExportTestData.find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } });
        res.json(exportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.get("/api/export-tests/:id", async (req, res) => {
    try {
        const exportTestData = await ExportTestData.findById(req.params.id)
        res.json(exportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.patch("/api/export-tests/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        const updatedExportTestData = await ExportTestData.findByIdAndUpdate(id, update, { new: true });

        if (!updatedExportTestData) {
            return res.status(404).json({ error: 'Export test data not found' });
        }

        res.json(updatedExportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportTestRouter.delete("/api/export-tests/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const deletedExportTestData = await ExportTestData.findByIdAndDelete(id);
        if (!deletedExportTestData) {
            return res.status(404).json({ error: 'Export test data not found' });
        }

        res.json(deletedExportTestData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = exportTestRouter;
