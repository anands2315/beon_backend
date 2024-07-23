const express = require('express');
const ExportData = require('../models/exports');
const TopSchema = require('../models/topExporters');
const exportRouter = express.Router();


exportRouter.post("/api/exports", async (req, res) => {

    console.log(req.body);
    try {
        let exportData = new ExportData(req.body);
        console.log(exportData);
        exportData = await exportData.save();
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.post('/api/topExporter', async (req, res) => {
    try {
        const { topExporters, topCountries, topPorts } = req.body;

        const exportData = new TopSchema({
            topExporters,
            topCountries,
            topPorts,
        });

        await exportData.save();

        res.status(200).json({ message: 'Data saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to save data', error: error.message });
    }
});

exportRouter.get('/api/topExporter', async (req, res) => {
    try {
        const data = await TopSchema.findOne(); // Retrieve the first document in the collection
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch data', error: error.message });
    }
});

exportRouter.get("/api/exports/sorted", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit);

        // Fetch export data based on limit
        const exportData = isNaN(limit)
            ? await ExportData.find().exec()
            : await ExportData.find().limit(limit).exec();

        const exporterCounts = {};
        const countryCounts = {};
        const portCounts = {};

        exportData.forEach((data) => {
            const { exporterName, countryOfDestination, portOfDischarge } = data;

            if (exporterName) {
                exporterCounts[exporterName] = (exporterCounts[exporterName] || 0) + 1;
            }

            if (countryOfDestination) {
                countryCounts[countryOfDestination] = (countryCounts[countryOfDestination] || 0) + 1;
            }

            if (portOfDischarge) {
                portCounts[portOfDischarge] = (portCounts[portOfDischarge] || 0) + 1;
            }
        });

        const sortedExporters = Object.entries(exporterCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const sortedPorts = Object.entries(portCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);

        res.json({
            topExporters: sortedExporters.map(([key, value]) => ({ exporterName: key, count: value })),
            topCountries: sortedCountries.map(([key, value]) => ({ countryOfDestination: key, count: value })),
            topPorts: sortedPorts.map(([key, value]) => ({ portOfDischarge: key, count: value })),
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit, 10) || null;
        let exportData;

        if (limit) {
            exportData = await ExportData.find({}).limit(limit);
        } else {
            exportData = await ExportData.find({});
        }

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.get("/api/exports/search", async (req, res) => {
    try {
        const searchQuery = req.query.q;
        if (!searchQuery) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        const regexQuery = { $regex: searchQuery, $options: "i" };

        // Determine if the search query can be converted to a number
        const ritcCode = !isNaN(searchQuery) ? Number(searchQuery) : null;

        // Build the $or array dynamically
        const orQuery = [
            { exporterName: regexQuery },
            { countryOfDestination: regexQuery },
            { itemDesc: regexQuery },
            { portOfDischarge: regexQuery },
            { currency: regexQuery },
        ];

        // Add ritcCode query only if it's a valid number
        if (ritcCode !== null) {
            orQuery.push({ ritcCode: ritcCode });
        }

        const exportData = await ExportData.find({
            $or: orQuery
        });

        res.json(exportData);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: "Internal server error" });
    }
});

exportRouter.get("/api/exports/search-page", async (req, res) => {
    try {
        const searchQuery = req.query.q;
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        if (!searchQuery) {
            return res.status(400).json({ error: "Query parameter 'q' is required" });
        }

        const regexQuery = { $regex: searchQuery, $options: "i" };

        // Determine if the search query can be converted to a number
        const ritcCode = !isNaN(searchQuery) ? Number(searchQuery) : null;

        // Build the $or array dynamically
        const orQuery = [
            { exporterName: regexQuery },
            { countryOfDestination: regexQuery },
            { itemDesc: regexQuery },
            { portOfDischarge: regexQuery },
            { currency: regexQuery },
        ];

        // Add ritcCode query only if it's a valid number
        if (ritcCode !== null) {
            orQuery.push({ ritcCode: ritcCode });
        }

        const exportData = await ExportData.find({
            $or: orQuery
        }).skip(skip).limit(limit);

        res.json(exportData);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: "Internal server error" });
    }
});



exportRouter.get("/api/exports/by-name-page", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const exportData = await ExportData
            .find({ exporterName: { $regex: req.query.exporterName, $options: "i" } })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-name", async (req, res) => {
    try {
        const exportData = await ExportData.find({ exporterName: { $regex: req.query.exporterName, $options: "i" } });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-country", async (req, res) => {
    try {
        const exportData = await ExportData.find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } }).limit(2000);
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-country-page", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const exportData = await ExportData
            .find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-itemDesc", async (req, res) => {
    try {
        const exportData = await ExportData.find({ itemDesc: { $regex: req.query.itemDesc, $options: "i" } });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-itemDesc-page", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const exportData = await ExportData
            .find({ itemDesc: { $regex: req.query.itemDesc, $options: "i" } })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status500.json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-iec", async (req, res) => {
    try {
        const { iec, limit } = req.query;

        const limitValue = limit ? parseInt(limit, 10) : null;

        // Build the query
        let query = ExportData.find({ iec: { $regex: iec, $options: "i" } });

        if (limitValue) {
            query = query.limit(limitValue);
        }

        // Execute the query
        const exportData = await query;

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-ritcCode-chart", async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData.find({ ritcCode: ritcCode });

        // Transform and aggregate the data
        let ritcCodeData = [];
        let ritcCodeCounts = {};

        exportData.forEach(exportDataItem => {
            let data = {
                'Company Name': exportDataItem.exporterName,
                'SB.No.': exportDataItem.sbNo,
                'SB.Date': exportDataItem.sbDate,
                'Iec': exportDataItem.iec,
                'Country': exportDataItem.countryOfDestination,
                'POD': exportDataItem.portOfDischarge,
                'UQC': exportDataItem.uqc,
                'RITC Code': exportDataItem.ritcCode,
                'Currency': exportDataItem.currency,
                'Quantity': exportDataItem.quantity,
                'Item Desc': exportDataItem.itemDesc,
                'Item Rate': exportDataItem.itemRate,
                'Item No': exportDataItem.itemNo,
                'Invoice Ser.No': exportDataItem.invoiceSerNo,
                'Invoice No': exportDataItem.invoiceNo,
                'Challan No': exportDataItem.challanNo,
                'FOB': exportDataItem.fob,
                '_id': exportDataItem._id,
            };
            ritcCodeData.push(data);

            let year = data['SB.Date'].toString().split('-')[2];
            let month = data['SB.Date'].toString().split('-')[1];
            let yearMonth = `${year}-${month}`;

            if (ritcCodeCounts[yearMonth]) {
                ritcCodeCounts[yearMonth] += 1;
            } else {
                ritcCodeCounts[yearMonth] = 1;
            }
        });

        // Send the transformed and aggregated data as the response
        res.json({ ritcCodeData, ritcCodeCounts });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-ritcCode", async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData.find({ ritcCode: ritcCode });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-ritcCode-page", async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData.find({ ritcCode: ritcCode });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-portOfDischarge", async (req, res) => {
    try {
        const exportData = await ExportData.find({ portOfDischarge: { $regex: req.query.portOfDischarge, $options: "i" } });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-portOfDischarge-page", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const exportData = await ExportData
            .find({ portOfDischarge: { $regex: req.query.portOfDischarge, $options: "i" } })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.get("/api/exports/by-currency", async (req, res) => {
    try {
        const exportData = await ExportData.find({ currency: { $regex: req.query.currency, $options: "i" } });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-currency-page", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const exportData = await ExportData
            .find({ currency: { $regex: req.query.currency, $options: "i" } })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/:id", async (req, res) => {
    try {
        const exportData = await ExportData.findById(req.params.id)
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.patch("/api/exports/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        const updatedExportData = await ExportData.findByIdAndUpdate(id, update, { new: true });

        if (!updatedExportData) {
            return res.status(404).json({ error: 'Export data not found' });
        }

        res.json(updatedExportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.delete("/api/exports/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Find the document by ID and update it
        const deletedExportData = await ExportData.findByIdAndDelete(id);
        if (!deletedExportData) {
            return res.status(404).json({ error: 'Export data not found' });
        }

        res.json(deletedExportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = exportRouter;