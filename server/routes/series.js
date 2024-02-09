const express = require("express");
const router = express.Router();
const mediaService = require("../services/mediaService");
const SeriesDb = require("../models/series.model");

router.route("/").get(async (req, res) => {
  SeriesDb.find()
    .then((seriess) => res.json(seriess))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id/:seasonNumber-:episodeNumber").get(async (req, res) => {
  try {
    // Get the series ID from the request
    const seriesId = req.params.id;
    const seasonNumber = req.params.seasonNumber;
    const episodeNumber = req.params.episodeNumber;

    // Get the series data from the providers
    let seriesDb = await SeriesDb.findOne({ seriesId: seriesId });

    // Check if series is found in DB
    if (seriesDb) {
      console.log("series found in DB!");
      // Send found series back to client
      res.render("player", {
        // url: seriesDb.source[seriesDb.source.length - 1].url,
        url: seriesDb.source.map((source) => source.url),
        subtitles: seriesDb.subtitles,
        seriesId: seriesId, // Pass the seriesId to the template
      });
    } else {
      console.log("series not found in DB, fetching from providers...");
      try {
        // Get the series data from the providers
        const seriesData = await mediaService.getSeriesData(
          seriesId,
          seasonNumber,
          episodeNumber
        );
        console.log("series data fetched from provider successfully:");

        // Create a new series DB entry
        console.log("Creating new series DB entry...");
        seriesDb = new SeriesDb({
          qualityStatus: seriesData.qualityStatus,
          seriesId: seriesId,
          title: seriesData.title,
          releaseDate: new Date(seriesData.releaseDate),
          source: seriesData.streamingLink.sources.map((source) => ({
            url: source.url,
            isM3U8: source.isM3U8,
          })),
          quality: seriesData.streamingLink.sources.map((source) =>
            source.quality.toString()
          ),
          subtitles: seriesData.streamingLink.subtitles.map((sub) => ({
            url: sub.url,
            language: sub.language,
          })),
        });
        await seriesDb.save();
        console.log("series DB entry created successfully");

        res.render("player", {
          url: seriesDb.source[seriesDb.source.length - 1].url,
          subtitles: seriesDb.subtitles,
          seriesId: seriesId, // Pass the seriesId to the template
        });
      } catch (error) {
        console.error("Error fetching series data:", error);
        res.status(500).send(error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching series data:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
