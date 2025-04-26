require("dotenv").config();

// Dependencies
const http = require("http");
const express = require("express");
const rateLimit = require('express-rate-limit');
const bodyParser = require("body-parser");
const authRoute = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const connectionToDb = require("./config/dbConfig");

// Initialize Express
const app = express();
const port = process.env.PORT || 8080;
const host = process.env.HOST || "localhost";
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
});

// Connection To Backend Server
const server = http.createServer(app);

// Connection To MongoDB Server
connectionToDb.connection();

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.env.IMAGE_PATH));
app.use(limiter);

// Routes
app.use("/api", authRoute, userRouter, productRouter);

// Start Server
server.listen(port, (err) => {
  if (!err) {
    console.log(`Server is listening at http://${host}:${port}`);
  } else {
    console.log(`Error at starting server: ${err}`);
  }
});