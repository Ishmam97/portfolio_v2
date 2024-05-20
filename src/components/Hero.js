import React from 'react';
import { Box, Typography, Container } from '@mui/material';
// import css from css/Hero.css
import './css/Hero.css'

function Hero() {
  return (
    <Container className="hero-container" maxWidth="lg" sx={{ display: 'flex', height: '80vh', alignItems: 'center', justifyContent: 'center' , backgroundColor:'#020104', fontFamily: 'Lato, sans-serif',fontWeight: 400, marginTop: '2.5rem', borderRadius: '10px', boxShadow: '0 0 25px rgba(197, 146, 255, 0.678)', border:'2px solid #c592ff'}}>
      <Box className="hero-image-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/img/me.jpeg" alt="Ishmam" style={{ width: '100%', height: 'auto', borderRadius:'25px' }} />
      </Box>
      <Box className="text-overlay" sx={{ textAlign: 'center', color:'#00FF9C' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{color:'#DFFF3D', fontWeight: 700}}>
          Innovating Tomorrow, Today.
        </Typography>
        <Typography variant="h4" component="h2" gutterBottom sx={{fontWeight: 700 }}>
          Hi, I'm Ishmam.
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{color:'#ff4081' ,fontWeight: 500 }}>
            <span role="img" aria-label="rocket">🚀</span> Software Engineer | <span role="img" aria-label="tools">🛠</span> Tech Enthusiast | <span role="img" aria-label="chart">📈</span> Problem Solver
        </Typography>
        <Typography variant="body1">
          Empowering technology through clean code and creative solutions.
        </Typography>
        <Typography variant="body1">
          Discover how I transform complex challenges into actionable software innovations.
        </Typography>
      </Box>
    </Container>
  );
}

export default Hero;