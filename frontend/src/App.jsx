// src/App.jsx

import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import Header from "./components/Header";
import AppRouter from "./AppRouter";

const App = () => (
  <Router>
    <Header />
    <main className="pt-16">
      <AppRouter />
    </main>
  </Router>
);

export default App;
