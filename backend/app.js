const express = require("express");
const propertyRoutes = require("./routes/propertyRoutes");
const userRoutes = require("./routes/userRoutes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// CORS configuration to allow credentials
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true, // This is crucial for cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse incoming JSON
app.use(express.json());

// Parse cookies
app.use(cookieParser());

// Mount property routes
app.use("/api/v1/rent/listing", propertyRoutes);

// Mount user routes
app.use("/api/v1/rent/user", userRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

module.exports = app;