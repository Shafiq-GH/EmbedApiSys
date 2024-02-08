const mongoose = require("mongoose");

// Define the schema
const movieSchema = new mongoose.Schema({
  movieId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  releaseDate: {
    type: Date,
    required: true,
  },
  source: {
    type: [
      {
        url: String,
        isM3U8: Boolean,
      },
    ],
    required: true,
  },
  quality: {
    type: [String], // This field is now an array of strings
    required: true,
  },
  qualityStatus: {
    type: String,
    required: true,
    enum: ["HD", "CAM"], // Optional: Enforces the value to be one of these two
  },
  subtitles: {
    type: [
      {
        url: String,
        language: String,
      },
    ],
    required: true,
  },
});

const MovieDb = mongoose.model("Movies", movieSchema);

module.exports = MovieDb;
