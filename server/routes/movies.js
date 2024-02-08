const express = require("express");
const router = express.Router();
const mediaService = require("../services/mediaService");
const MovieDb = require("../models/movies.model");

router.route("/").get(async (req, res) => {
  MovieDb.find()
    .then((movies) => res.json(movies))
    .catch((err) => res.status(400).json("Error: " + err));
});

router.route("/:id").get(async (req, res) => {
  try {
    // Get the movie ID from the request
    const movieId = req.params.id;

    // Get the movie data from the providers
    let movieDb = await MovieDb.findOne({ movieId: movieId });

    // Check if movie is found in DB
    if (movieDb) {
      console.log("Movie found in DB!");
      // Send found movie back to client
      res.render("player", {
        // url: movieDb.source[movieDb.source.length - 1].url,
        url: movieDb.source.map((source) => source.url),
        subtitles: movieDb.subtitles,
        movieId: movieId, // Pass the movieId to the template
      });
    } else {
      console.log("Movie not found in DB, fetching from providers...");
      try {
        // Get the movie data from the providers
        const movieData = await mediaService.getMovieData(movieId);
        console.log("Movie data fetched from provider successfully:");

        // Create a new movie DB entry
        console.log("Creating new movie DB entry...");
        movieDb = new MovieDb({
          qualityStatus: movieData.qualityStatus,
          movieId: movieId,
          title: movieData.title,
          releaseDate: new Date(movieData.releaseDate),
          source: movieData.streamingLink.sources.map((source) => ({
            url: source.url,
            isM3U8: source.isM3U8,
          })),
          quality: movieData.streamingLink.sources.map((source) =>
            source.quality.toString()
          ),
          subtitles: movieData.streamingLink.subtitles.map((sub) => ({
            url: sub.url,
            language: sub.language,
          })),
        });
        await movieDb.save();
        console.log("Movie DB entry created successfully:");

        res.render("player", {
          url: movieDb.source[movieDb.source.length - 1].url,
          subtitles: movieDb.subtitles,
          movieId: movieId, // Pass the movieId to the template
        });
      } catch (error) {
        console.error("Error fetching movie data:", error);
        res.status(500).send(error.message);
      }
    }
  } catch (error) {
    console.error("Error fetching movie data:", error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
