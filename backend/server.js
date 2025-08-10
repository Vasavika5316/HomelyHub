const mongoose = require("mongoose");
const app = require("./app");
const dotenv = require("dotenv");

// Load environment variables from config.env
dotenv.config({ path: "./config.env" });

// MongoDB connection URI
let DB = process.env.DATABASE_LOCAL;

// Log the DB URI (optional for debugging)
console.log(DB);

// Connect to MongoDB
mongoose.connect(DB)
  .then(() => console.log("DB connection Successful"))
  .catch(err => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Start the server on port 8002 (changed to avoid conflict)
const port = 8002;
app.listen(port, () => {
    console.log("App Running on port: " + port);
});
