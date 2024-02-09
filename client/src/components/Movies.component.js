import React, { Component } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table.tsx";

export default class Movies extends Component {
  state = {
    movies: [],
  };

  componentDidMount() {
    this.fetchMovies();
  }

  fetchMovies = async () => {
    try {
      const response = await axios.get("https://server1.popit.watch/movies/");
      this.setState({ movies: response.data });
    } catch (error) {
      console.error("Error fetching movies", error);
    }
  };
  render() {
    const { movies } = this.state;
    return (
      <Table>
        <TableCaption>Movie Database</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">TMDB_ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Quality</TableHead>
            <TableHead className="text-right">Release Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {this.state.movies.map((movie) => (
            <TableRow key={movie.movieId}>
              <TableCell className="font-medium">{movie.movieId}</TableCell>
              <TableCell>{movie.title}</TableCell>
              <TableCell>{movie.qualityStatus}</TableCell>
              <TableCell className="text-right">
                {new Date(movie.releaseDate).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }
}
