const mongoose = require('mongoose');

/**
 * @file Defines the Mongoose schema for an individual inspection record.
 * This schema is the blueprint for how inspection data is stored in MongoDB.
 */

const inspectionSchema = new mongoose.Schema(
  {
    serialNumber: {
      type: String,
      trim: true,
      default: null, // The AI may not find a serial number in every image.
    },
    status: {
      type: String,
      required: true,
      enum: ['pass', 'fail', 'pending_review'], // Enforces a set of valid status values.
      default: 'pending_review',
    },
    confidenceScore: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    inspectorId: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    // It's good practice to store the raw AI output for auditing and debugging.
    aiRawOutput: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    // This option automatically adds `createdAt` and `updatedAt` fields to the document.
    timestamps: true,
  }
);

const Inspection = mongoose.model('Inspection', inspectionSchema);

module.exports = Inspection;