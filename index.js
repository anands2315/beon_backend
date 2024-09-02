const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const compression = require('compression');

// IMPORTS FROM OTHER FILES
const exportRouter = require('./routes/exports.js');
const exportTestRouter = require('./routes/exportTest');
const favoriteRouter = require('./routes/favorite');
const userRouter = require('./routes/user');
const faqRouter = require('./routes/faq.js');
const shipmentRouter = require('./routes/shipment.js');
const shipmentPODRouter = require('./routes/shipmentPOD.js');
const shipmentHSNRouter = require('./routes/shipmentHSN.js');
const shipmentNameRouter = require('./routes/shipmentName.js');
const aggregationRouter = require('./routes/aggregate.js');
const issueRouter = require('./routes/issue.js');
const recentSearchRouter = require('./routes/recentSearch.js');
const blogRouter = require('./routes/blog.js');

// INITIALIZE
const PORT = 3000;
const app = express();
// const DB = "mongodb://benodb:benoadmin1313@3.7.3.84:27017/?authSource=test";
const DB = "mongodb+srv://anandsinghfuerte:beon123@cluster0.zue4qwl.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0";

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(compression());

// ROUTES
app.use(exportRouter);
app.use(exportTestRouter);
app.use(favoriteRouter);
app.use(userRouter);
app.use(faqRouter);
app.use(shipmentRouter);
app.use(shipmentPODRouter);
app.use(shipmentHSNRouter);
app.use(shipmentNameRouter);
app.use(issueRouter);
app.use(recentSearchRouter);
app.use(blogRouter);
app.use(aggregationRouter);


// CONNECT TO DATABASE
const connectDB = async () => {
    try {
        await mongoose.connect(DB);
        console.log("Connection Successful");
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
};

const startServer = async () => {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
        console.log(`connected at port ${PORT}`);
    });
};

startServer();
