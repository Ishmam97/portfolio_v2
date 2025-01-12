import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import Projects from './components/Projects';
import AboutMe from './components/AboutMe';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import NavSidebar from './components/NavSidebar';
// add css file
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import NavbarTheme from './theme/NavbarTheme';
function App() {
  return (
    // add style for 0 padding in div
    <div>
      <Router>

        <ThemeProvider theme={NavbarTheme}>
          <Navbar />
        </ThemeProvider>
        <NavSidebar />
        <Routes>
          <Route path="/" element={<HomePage/>} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/about" element={<AboutMe />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
