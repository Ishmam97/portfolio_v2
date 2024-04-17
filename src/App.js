import React from 'react';
import Navbar from './components/Navbar';
// add css file
import './App.css';
import { ThemeProvider } from '@mui/material/styles';
import NavbarTheme from './theme/NavbarTheme';
function App() {
  return (
    // add style for 0 padding in div
    <div>
      <ThemeProvider theme={NavbarTheme}>
        <Navbar />
      </ThemeProvider>
    </div>
  );
}

export default App;
