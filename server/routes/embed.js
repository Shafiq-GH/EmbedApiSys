const express = require("express");
const router = express.Router();
const mediaService = require("../services/mediaService");

// Movie embedding endpoint
// Endpoint to embed a movie
router.get("embed/movie/:id", async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieData = await mediaService.getMovieData(movieId);

    // Assuming movieData contains a property `streamingLink` with the m3u8 URL
    res.render("player", { streamingLink: movieData.streamingLink });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// TV series embedding endpoint
router.get("/tv/:id/:season-:episode", async (req, res) => {
  try {
    const { id, season, episode } = req.params;
    const episodeData = await mediaService.getTVData(id, season, episode);
    // Render or send the data
    res.render("tvPlayer", { episodeData });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
