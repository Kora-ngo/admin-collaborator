require('dotenv').config();
const cors = require('cors');
const express = require('express');

var port = process.env.PORT;

// Express setup
const app = express();

//Middleware
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
app.use(cors());


app.listen(port, () => {
    console.log("Server is running on port ", port);
})