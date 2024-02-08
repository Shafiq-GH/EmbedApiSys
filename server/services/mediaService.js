let fetch;
import("node-fetch")
  .then(({ default: fetchImport }) => {
    fetch = fetchImport;
  })
  .catch((err) => console.error("Failed to load node-fetch:", err));
const { MOVIES } = require("@consumet/extensions");

// Initialize all providers
const providers = {
  FlixHQ: new MOVIES.FlixHQ(),
  goku: new MOVIES.Goku(),
  moviesHd: new MOVIES.MovieHdWatch(),
};

// Function to fetch the title from TheMovieDB using the provided ID
async function getTitleFromTMDB(id, isMovie = true) {
  const tmdbUrl = `https://api.themoviedb.org/3/${
    isMovie ? "movie" : "tv"
  }/${id}?language=en-US`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization:
        "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwOGFhYWNhYjAwNzFjMDQ1Y2Q2NjViOTkxMTM3OTMyOSIsInN1YiI6IjY1NmJhODlkODgwNTUxMDEwMDBkNjg1NiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KLtHgAlZQRhNX5-MU5uYJq4LQGuWA4biReMChpMKz0E",
    },
  };

  try {
    const response = await fetch(tmdbUrl, options);
    const data = await response.json();
    console.log("Title fetched from TMDB:", data.original_title || data.name);
    return data.original_title || data.name; // Use 'name' for TV shows
  } catch (error) {
    console.error("error:" + error);
    throw new Error("Unable to fetch title from TheMovieDB");
  }
}

// Search across all providers for the given title
async function searchForMedia(title, isMovie = true) {
  let allResults = [];
  let currentPage = 1;
  let hasNextPage = false;

  for (let key in providers) {
    console.log("Searching provider:", key, "for:", title);
    try {
      const provider = providers[key];
      const searchResults = isMovie
        ? await provider.search(title)
        : await provider.searchTvShows(title);

      // Assuming searchResults is an object with the expected structure
      if (
        searchResults &&
        searchResults.results &&
        searchResults.results.length > 0
      ) {
        const result = searchResults.results.find((r) => r.title === title);
        if (result) {
          return {
            providerr: key,
            id: result.id,
            title: title,
          };
        }
        currentPage = searchResults.currentPage;
        hasNextPage = searchResults.hasNextPage;
      }
    } catch (error) {
      console.error(`Error with provider ${key}:`, error);
    }
  }

  throw new Error("Media not found with any providers");
}

// Extract streaming link from the media information
async function extractStreamingLink(provider, id, singleId) {
  const maxRetries = 3; // Maximum number of retries
  let currentAttempt = 0;

  while (currentAttempt < maxRetries) {
    try {
      const sourceData = await provider.fetchEpisodeSources(singleId, id);
      if (!sourceData || !sourceData.sources || !sourceData.subtitles) {
        throw new Error("Invalid source data from provider");
      }
      const extractedSource = {
        sources: sourceData.sources.map((s) => ({
          url: s.url,
          quality: s.quality,
          isM3U8: s.isM3U8,
        })),
        subtitles: sourceData.subtitles.map((s) => ({
          url: s.url,
          language: s.lang,
        })),
      };
      return extractedSource;
    } catch (error) {
      console.error("Error extracting streaming link:", error);
      if (
        error.message.includes("Malformed UTF-8 data") &&
        currentAttempt < maxRetries - 1
      ) {
        console.log(
          `Waiting 2 seconds before retrying attempt ${
            currentAttempt + 2
          } of ${maxRetries}...`
        );
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
        currentAttempt++;
        continue; // Skip the rest of the loop and try again
      } else {
        // For the last attempt or other errors, rethrow the error
        throw new Error(
          `Error extracting streaming link after ${
            currentAttempt + 1
          } attempts: ${error.message}`
        );
      }
    }
  }
}

// Get movie data using TheMovieDB ID
async function getMovieData(tmdbId) {
  console.log("Fetching movie data from TMDB using tmdbid:", tmdbId);
  try {
    const title = await getTitleFromTMDB(tmdbId);
    const { providerr, id } = await searchForMedia(title);
    const provider = providers[providerr];
    const mediaInfo = await provider.fetchMediaInfo(id);
    const singleId = mediaInfo.episodes[0].id;
    const streamingLink = await extractStreamingLink(provider, id, singleId);
    const isHDAvailable = await streamingLink.sources.some((source) => {
      const qualityNumber = parseInt(source.quality, 10);
      return !isNaN(qualityNumber) && qualityNumber >= 1080;
    });
    const qualityStatus = isHDAvailable ? "HD" : "CAM";
    return {
      streamingLink,
      qualityStatus,
      title: mediaInfo.title,
      releaseDate: mediaInfo.releaseDate,
      movieId: tmdbId,
    };
  } catch (error) {
    console.error("Error inside getMovieData: ", error);
    throw new Error(`Error fetching movie data: ${error.message}`);
  }
}

// Get TV show data using TheMovieDB ID, season, and episode
async function getTVData(tmdbId, season, episode) {
  try {
    const title = await getTitleFromTMDB(tmdbId, false);
    const { provider, searchResults } = await searchForMedia(title, false);
    const tvShowInfo = searchResults.find((show) => show.id === tmdbId);

    if (!tvShowInfo) {
      throw new Error("TV show not found");
    }

    const episodeData = await provider.fetchEpisodeSources(
      tvShowInfo.id,
      season,
      episode
    );
    const streamingLink = extractStreamingLink(episodeData);

    return {
      streamingLink,
      title: `${tvShowInfo.title} S${season}E${episode}`,
    };
  } catch (error) {
    throw new Error(`Error fetching TV data: ${error.message}`);
  }
}

module.exports = {
  getMovieData,
  getTVData,
};
