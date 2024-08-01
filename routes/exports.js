const express = require('express');
const ExportData = require('../models/exports');
const ShipmentPOD = require('../models/shipmentPOD');
const TopSchema = require('../models/topExporters');
const chaptercodedatas = require('../models/chapterCode');
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

exportRouter.get('/api/unique-pods', async (req, res) => {
    try {
        // Aggregation pipeline to get unique pods
        const uniquePODS = await ExportData.aggregate([
            {
                $group: {
                    _id: "$countryOfDestination"
                }
            },
            {
                $project: {
                    _id: 0,
                    countryOfDestination: "$_id"
                }
            }
        ]);

        res.status(200).json(uniquePODS);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

exportRouter.get('/api/unique-pods-not-in-shipment', async (req, res) => {
    try {
        const uniquePODS = await ExportData.aggregate([
            {
                $group: {
                    _id: "$portOfDischarge"
                }
            },
            {
                $lookup: {
                    from: "shipmentpods", // The name of the collection containing ShipmentPOD documents
                    localField: "_id",
                    foreignField: "pod", // Adjust this field according to the actual field name in ShipmentPOD collection
                    as: "shipmentPodMatch"
                }
            },
            {
                $match: {
                    "shipmentPodMatch": { $size: 0 }
                }
            },
            {
                $project: {
                    _id: 0,
                    portOfDischarge: "$_id"
                }
            }
        ]);

        res.status(200).json(uniquePODS);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

exportRouter.post('/api/aggregate-chapter-code-data', async (req, res) => {
    try {
        // Step 1: Aggregate shipment counts by chapter code and month
        await ExportData.aggregate([
            {
                $addFields: {
                    chapterCode: { $substr: ["$ritcCode", 0, 2] }, // Extract chapter code from ritcCode
                    monthYear: {
                        $concat: [
                            { $substr: ["$sbDate", 3, 2] }, "-", { $substr: ["$sbDate", 6, 4] }
                        ]
                    } // Create monthYear field
                }
            },
            {
                $group: {
                    _id: {
                        chapterCode: "$chapterCode",
                        monthYear: "$monthYear"
                    },
                    shipmentCount: { $sum: 1 } // Count the number of documents for each chapterCode and monthYear
                }
            },
            {
                $group: {
                    _id: "$_id.chapterCode",
                    shipmentsByMonth: {
                        $push: {
                            monthYear: "$_id.monthYear",
                            shipmentCount: "$shipmentCount"
                        }
                    },
                    totalShipments: { $sum: "$shipmentCount" } // Total number of shipments for the chapterCode
                }
            },
            {
                $project: {
                    _id: 0,
                    chapterCode: "$_id",
                    shipmentsByMonth: 1,
                    totalShipments: 1
                }
            },
            {
                $out: "chaptercodedatas"  // Store the result in a new collection 'chaptercodedatas'
            }
        ]);

        res.status(200).json({ message: 'Aggregation and storing completed successfully.' });
    } catch (err) {
        console.error('Error during aggregation and storing:', err);
        res.status(500).json({ error: 'An error occurred during aggregation.' });
    }
});

exportRouter.get('/api/chapter-code-data/:chapterCode', async (req, res) => {
    try {
        const { chapterCode } = req.params;

        // Fetch data for the specified chapterCode
        const data = await chaptercodedatas.findOne({ chapterCode }).sort({ monthYear: -1 });

        if (!data) {
            return res.status(404).json({ message: 'Data not found for the specified chapter code.' });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching chapter code data:', err);
        res.status(500).json({ error: 'An error occurred while fetching chapter code data.' });
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
        }).sort({ sbDate: -1 });

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
        }).sort({ sbDate: -1 }).skip(skip).limit(limit);

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
            .find({ exporterName: { $regex: req.query.exporterName, $options: "i" } }).sort({ sbDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-name", async (req, res) => {
    try {
        const exportData = await ExportData.find({ exporterName: { $regex: req.query.exporterName, $options: "i" } }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-country", async (req, res) => {
    try {
        const exportData = await ExportData.find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } }).sort({ sbDate: -1 });
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
            .find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } }).sort({ sbDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-itemDesc", async (req, res) => {
    try {
        const exportData = await ExportData.find({ itemDesc: { $regex: req.query.itemDesc, $options: "i" } }).sort({ sbDate: -1 });
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
            .find({ itemDesc: { $regex: req.query.itemDesc, $options: "i" } }).sort({ sbDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-iec", async (req, res) => {
    try {
        const { iec, limit } = req.query;

        const limitValue = limit ? parseInt(limit, 10) : null;

        // Build the query
        let query = ExportData.find({ iec: { $regex: iec, $options: "i" } }).sort({ sbDate: -1 });

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


exportRouter.get("/api/exports/by-ritcCode", async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData.find({ ritcCode: ritcCode }).sort({ sbDate: -1 }).limit(2000);
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-ritcCode-page", async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 15;
        const skip = (page - 1) * limit;

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData
            .find({ ritcCode: ritcCode }).sort({ sbDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.get("/api/exports/by-portOfDischarge", async (req, res) => {
    try {
        const exportData = await ExportData.find({ portOfDischarge: { $regex: req.query.portOfDischarge, $options: "i" } }).sort({ sbDate: -1 });
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
            .find({ portOfDischarge: { $regex: req.query.portOfDischarge, $options: "i" } }).sort({ sbDate: -1 })
            .skip(skip)
            .limit(limit);

        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.get("/api/exports/by-currency", async (req, res) => {
    try {
        const exportData = await ExportData.find({ currency: { $regex: req.query.currency, $options: "i" } }).sort({ sbDate: -1 });
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
            .find({ currency: { $regex: req.query.currency, $options: "i" } }).sort({ sbDate: -1 })
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