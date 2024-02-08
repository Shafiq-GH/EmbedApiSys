import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

import NavBar from "./components/NavBar.component";
// import Home from "./components/Home.component";
import Movies from "./components/Movies.component";
// import Add from "./components/Add.component";

import Table from "./components/Movies.component";

function App() {
  return (
    <Router>
      <div className="container">
        <NavBar />

        <br />
        <Routes>
          {/* <Route path="/" exact component={Home} /> */}
          <Route path="/movies" element={<Table />} />
          {/* <Route path="/add" component={Add} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
