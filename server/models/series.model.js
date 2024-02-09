const mongoose = require("mongoose");

// Define the schema
const seriesSchema = new mongoose.Schema({
  seriesId: {
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
  episodes: {
    type: [
      {
        episodeId: String,
        episodeNumber: Number,
        seasonNumber: Number,
      },
    ],
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

const SeriesDb = mongoose.model("Series", seriesSchema);

module.exports = SeriesDb;
