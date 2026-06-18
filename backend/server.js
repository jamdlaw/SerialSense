/**
 * @file The main entry point for the SerialSense AI backend server.
 */

// 1. Import Dependencies
require('dotenv').config(); // Loads environment variables from the .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// 3. Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for the React frontend
app.use(express.json()); // Enable parsing of JSON in request bodies

// 4. Database Connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error(`❌ MongoDB Connection Error: ${err.message}`);
    // Exit process with failure
    process.exit(1);
  }
};

connectDB();

// 5. Basic Test Route
app.get('/', (req, res) => {
  res.send('SerialSense AI Server is running!');
});

// 6. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});