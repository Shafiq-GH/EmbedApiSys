const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

require("dotenv").config();

const app = express();
app.use(cors());
app.set("view engine", "ejs");
const uri = process.env.ATLAS_URI;
mongoose.connect(uri, {
  useNewUrlParser: true,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("MongoDB database connection established successfully");
});

const movieDb = require("./routes/movies");
const embedMovie = require("./routes/embed");
const seriesDb = require("./routes/series");

app.use("/movies", movieDb);
app.use("/embed", embedMovie);
// app.use("/series", seriesDb);

try {
  app.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
} catch (error) {
  console.error("Error connecting to the database:", error);
}
/**
 * Connects to MongoDB database using Mongoose.
 * Configures Express app with middlewares.
 * Sets up routes for movies and embed.
 * Starts Express server listening on port from .env or 3000.
 */
