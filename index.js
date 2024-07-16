const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");

//IMPORTS FROM OTHER FILES
const exportRouter = require('./routes/exports.js');
const exportTestRouter = require('./routes/exportTest');
const favoriteRouter = require('./routes/favorite');
const userRouter = require('./routes/user');
const faqRouter = require('./routes/faq.js');

//INITIALIZE
const PORT = 3000;
const app = express();
const DB = "mongodb://benodb:benoadmin1313@3.7.3.84:27017/?authSource=test"


//middleware
app.use(cors());
app.use(express.json());
app.use(exportRouter);
app.use(exportTestRouter);
app.use(favoriteRouter);
app.use(userRouter);
app.use(faqRouter);

//Connections
mongoose.connect(DB)
    .then(() => {
        console.log("Connection Successful");
    },)
    .catch((e) => {
        console.log(e);
    },);

app.listen(PORT, "0.0.0.0", () => {
    console.log(`connected at port ${PORT}`);
})