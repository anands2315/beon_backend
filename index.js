const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

// IMPORTS FROM OTHER FILES
const exportRouter = require('./routes/exports.js');
const exportTestRouter = require('./routes/exportTest');
const favoriteRouter = require('./routes/favorite');
const userRouter = require('./routes/user');
const faqRouter = require('./routes/faq.js');

// INITIALIZE
const PORT = 3000;
const app = express();
const DB = "mongodb+srv://anandsinghfuerte:beon123@cluster0.zue4qwl.mongodb.net/mydatabase?retryWrites=true&w=majority&appName=Cluster0";

// MIDDLEWARE
app.use(cors());
app.use(express.json());
app.use(exportRouter);
app.use(exportTestRouter);
app.use(favoriteRouter);
app.use(userRouter);
app.use(faqRouter);

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
