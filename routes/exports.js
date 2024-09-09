const express = require('express');
const ExportData = require('../models/exports');
const NodeCache = require('node-cache');
const TopSchema = require('../models/topExporters');
const chaptercodedatas = require('../models/chapterCode');
const auth = require('../middleware/auth');
const exportRouter = express.Router();

const cache = new NodeCache({ stdTTL: 600 });


exportRouter.get('/top-data', async (req, res) => {
    try {
        // Run all three queries in parallel
        const [topExporters, topCountries, topPorts] = await Promise.all([
            ExportData.aggregate([
                { $group: { _id: "$exporterName", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },  // Limit early to reduce documents
                { $project: { _id: 0, exporterName: "$_id", count: 1 } }
            ]),
            ExportData.aggregate([
                { $group: { _id: "$countryOfDestination", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { _id: 0, countryOfDestination: "$_id", count: 1 } }
            ]),
            ExportData.aggregate([
                { $group: { _id: "$portOfDischarge", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $project: { _id: 0, portOfDischarge: "$_id", count: 1 } }
            ])
        ]);

        // Combine the results and send as JSON response
        res.status(200).json({ topExporters, topCountries, topPorts });

    } catch (err) {
        // Handle any errors that occur during the request
        res.status(500).json({ error: err.message });
    }
});



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
        const data = await TopSchema.findOne().lean(); // Retrieve the first document in the collection
        if (!data) {
            return res.status(404).json({ message: 'Data not found' });
        }
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch data', error: error.message });
    }
});


// Assuming you're using Express and have set up an exportRouter
exportRouter.get('/api/unique-values', async (req, res) => {
    try {
        const field = req.query.field;

        // Check if the field is provided
        if (!field) {
            return res.status(400).json({ message: 'Field query parameter is required' });
        }

        // Create an aggregation pipeline based on the provided field
        const uniqueValues = await ExportData.aggregate([
            {
                $group: {
                    _id: null,
                    values: { $addToSet: `$${field}` }
                }
            },
            {
                $project: {
                    _id: 0,
                    values: 1
                }
            }
        ]);

        // Extract the array from the aggregation result
        const valuesArray = uniqueValues.length > 0 ? uniqueValues[0].values : [];

        res.status(200).json({ field, values: valuesArray });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

exportRouter.post('/api/aggregate-chapter-code-data', auth, async (req, res) => {
    try {
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
                    shipmentsByMonth: {
                        $sortArray: {
                            input: "$shipmentsByMonth",
                            sortBy: { monthYear: 1 }
                        }
                    },
                    totalShipments: 1
                }
            },
            {
                $out: "chaptercodedatas" // Store the result in a new collection 'chaptercodedatas'
            }
        ]);

        res.status(200).json({ message: 'Aggregation and storing completed successfully.' });
    } catch (err) {
        console.error('Error during aggregation and storing:', err);
        res.status(500).json({ error: 'An error occurred during aggregation.' });
    }
});


exportRouter.get('/api/chapter-code-data/:chapterCode', auth, async (req, res) => {
    try {
        const { chapterCode } = req.params;

        // Fetch data for the specified chapterCode
        const data = await chaptercodedatas.findOne({ chapterCode });

        if (!data) {
            return res.status(404).json({ message: 'Data not found for the specified chapter code.' });
        }

        res.status(200).json(data);
    } catch (err) {
        console.error('Error fetching chapter code data:', err);
        res.status(500).json({ error: 'An error occurred while fetching chapter code data.' });
    }
});

exportRouter.get("/api/exports", auth, async (req, res) => {
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

exportRouter.get("/api/exports/search", auth, async (req, res) => {
    try {
        const { field, value, secondaryField, secondaryValue, page = 1, limit = 30 } = req.query;
        const skip = (page - 1) * limit;

        if (!value) {
            return res.status(400).json({ error: "Query parameter 'value' is required" });
        }

        // Generate a cache key based on the query parameters
        const cacheKey = JSON.stringify({ field, value, secondaryField, secondaryValue, page, limit });

        // Check if the response is in the cache
        const cachedData = cache.get(cacheKey);
        if (cachedData) {
            return res.json(cachedData);
        }

        // Build the query
        let query = {};
        if (field) {
            if (["ritcCode", "sbNo", "quantity", "itemRate", "fob"].includes(field)) {
                const numericValue = Number(value);
                if (isNaN(numericValue)) {
                    return res.status(400).json({ error: `Invalid ${field} parameter` });
                }
                query[field] = numericValue;
            } else if (field === "sbDate") {
                query[field] = value;
            } else {
                query[field] = { $regex: value, $options: "i" };
            }
        } else {
            const regexQuery = { $regex: value, $options: "i" };
            query = {
                $or: [
                    { exporterName: regexQuery },
                    { consigneeName: regexQuery },
                    { portOfDischarge: regexQuery },
                    { currency: regexQuery },
                    { itemDesc: regexQuery },
                    { countryOfDestination: regexQuery },
                    { iec: regexQuery },
                    { sbDate: value },
                    { sbNo: Number(value) || { $exists: true } },
                    { quantity: Number(value) || { $exists: true } },
                    { itemRate: Number(value) || { $exists: true } },
                    { fob: Number(value) || { $exists: true } },
                    { ritcCode: Number(value) || { $exists: true } }
                ]
            };
        }

        // Apply secondary filter if provided
        if (secondaryField && secondaryValue) {
            if (["ritcCode", "sbNo", "quantity", "itemRate", "fob"].includes(secondaryField)) {
                const numericValue = Number(secondaryValue);
                if (!isNaN(numericValue)) {
                    query[secondaryField] = numericValue;
                }
            } else if (secondaryField === "sbDate") {
                query[secondaryField] = secondaryValue;
            } else {
                query[secondaryField] = { $regex: secondaryValue, $options: "i" };
            }
        }

        // Find data with pagination, without counting total documents
        const paginatedResults = await ExportData.find(query)
            .sort({ sbDate: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean()
            .exec();

        // Cache the response
        cache.set(cacheKey, paginatedResults);

        // Send the response
        res.json(paginatedResults);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/search-page", auth, async (req, res) => {
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


exportRouter.get("/api/exports/by-name-page", auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 15;
        const skip = (page - 1) * limit;

        const query = { exporterName: { $regex: req.query.exporterName, $options: "i" } };
        const totalDocuments = await ExportData.countDocuments(query);
        const exportData = await ExportData.find(query).sort({ sbDate: -1 }).skip(skip).limit(limit);

        console.log("Page:", page, "Skip:", skip, "Limit:", limit, "Total Documents:", totalDocuments, "Fetched Data Length:", exportData.length);
        res.json(exportData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-name", auth, async (req, res) => {
    try {
        const query = { exporterName: { $regex: req.query.exporterName, $options: "i" } };
        const totalDocuments = await ExportData.countDocuments(query);
        const exportData = await ExportData.find(query).sort({ sbDate: -1 }).limit(500);

        console.log("Total Documents:", totalDocuments, "Fetched Data Length:", exportData.length);
        res.json(exportData);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


exportRouter.get("/api/exports/by-country", auth, async (req, res) => {
    try {
        const exportData = await ExportData.find({ countryOfDestination: { $regex: req.query.countryOfDestination, $options: "i" } }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-country-page", auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 30;
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


exportRouter.get("/api/exports/by-itemDesc", auth, async (req, res) => {
    try {
        const exportData = await ExportData.find({ itemDesc: { $regex: req.query.itemDesc, $options: "i" } }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-itemDesc-page", auth, async (req, res) => {
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

exportRouter.get("/api/exports/by-iec", auth, async (req, res) => {
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


exportRouter.get("/api/exports/by-ritcCode", auth, async (req, res) => {
    try {
        const ritcCode = Number(req.query.ritcCode);

        // If ritcCode is not a number, return an error
        if (isNaN(ritcCode)) {
            return res.status(400).json({ error: "Invalid ritcCode parameter" });
        }

        // Find export data with the specified ritcCode
        const exportData = await ExportData.find({ ritcCode: ritcCode }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-ritcCode-page", auth, async (req, res) => {
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



exportRouter.get("/api/exports/by-portOfDischarge", auth, async (req, res) => {
    try {
        const exportData = await ExportData.find({ portOfDischarge: { $regex: req.query.portOfDischarge, $options: "i" } }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-portOfDischarge-page", auth, async (req, res) => {
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



exportRouter.get("/api/exports/by-currency", auth, async (req, res) => {
    try {
        const exportData = await ExportData.find({ currency: { $regex: req.query.currency, $options: "i" } }).sort({ sbDate: -1 });
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

exportRouter.get("/api/exports/by-currency-page", auth, async (req, res) => {
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


exportRouter.get("/api/exports/:id", auth, async (req, res) => {
    try {
        const exportData = await ExportData.findById(req.params.id)
        res.json(exportData);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});



exportRouter.patch("/api/exports/:id", auth, async (req, res) => {
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


exportRouter.delete("/api/exports/:id", auth, async (req, res) => {
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