/**
 * @file The main entry point for the SerialSense AI backend server.
 */

// 1. Import Dependencies
require('dotenv').config(); // Loads environment variables from the .env file
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { analyzeImage } = require('./services/aiService');
const Inspection = require('./models/inspectionModel');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// 3. Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing for the React frontend
app.use(express.json({ limit: '50mb' })); // Enable parsing of JSON in request bodies
app.use(express.urlencoded({ extended: true })); // For Twilio webhooks

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

// 6. Twilio Webhook Route
app.post('/api/webhooks/twilio', async (req, res) => {
  try {
    const imageUrl = req.body.MediaUrl0;
    const inspectorId = req.body.From || 'unknown_inspector';

    if (!imageUrl) {
      return res.status(400).send('No image provided.');
    }

    // 1. Analyze the image with AI
    const aiData = await analyzeImage(imageUrl);

    // 2. Decision Tree Logic
    let finalStatus = 'pending_review';
    const isHighConfidence = typeof aiData.confidence_score === 'number' && aiData.confidence_score >= 0.80;
    const hasValidSerial = aiData.serial_number !== null && aiData.serial_number !== undefined;
    const hasValidStatus = ['pass', 'fail'].includes(aiData.inspection_status);
    
    if (isHighConfidence && hasValidSerial && hasValidStatus) {
      finalStatus = aiData.inspection_status;
    }

    // 3. Save to MongoDB
    const record = new Inspection({
      serialNumber: aiData.serial_number || null,
      status: finalStatus,
      confidenceScore: aiData.confidence_score || 0,
      inspectorId: inspectorId,
      imageUrl: imageUrl,
      aiRawOutput: aiData
    });

    await record.save();

    // 4. Respond to Twilio
    res.type('text/xml').send('<Response></Response>');
  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 7. Direct Admin Upload Route
app.post('/api/upload', async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).send('No image provided.');
    }

    // 1. Analyze the image with AI
    const aiData = await analyzeImage(imageBase64);

    // 2. Decision Tree Logic
    let finalStatus = 'pending_review';
    const isHighConfidence = typeof aiData.confidence_score === 'number' && aiData.confidence_score >= 0.80;
    const hasValidSerial = aiData.serial_number !== null && aiData.serial_number !== undefined;
    const hasValidStatus = ['pass', 'fail'].includes(aiData.inspection_status);
    
    if (isHighConfidence && hasValidSerial && hasValidStatus) {
      finalStatus = aiData.inspection_status;
    }

    // 3. Save to MongoDB
    const record = new Inspection({
      serialNumber: aiData.serial_number || null,
      status: finalStatus,
      confidenceScore: aiData.confidence_score || 0,
      inspectorId: 'admin_upload',
      imageUrl: imageBase64,
      aiRawOutput: aiData
    });

    await record.save();

    res.status(200).json({ message: 'Upload successful', record });
  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 8. Fetch all records
app.get('/api/inspections', async (req, res) => {
  try {
    const records = await Inspection.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    console.error('Fetch Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 9. Update a record (Manual Override)
app.put('/api/inspections/:id', async (req, res) => {
  try {
    const { serialNumber, status } = req.body;
    const record = await Inspection.findByIdAndUpdate(
      req.params.id, 
      { serialNumber, status }, 
      { new: true }
    );
    res.status(200).json(record);
  } catch (error) {
    console.error('Update Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 10. Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});