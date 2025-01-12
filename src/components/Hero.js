import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import { ReactTyped } from "react-typed";
// import css from css/Hero.css
import './css/Hero.css'

function Hero() {
  return (
    <Container className="section-container hero-container" sx={{display: 'flex'}}>
      <Box className="hero-image-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/img/me.jpeg" alt="Ishmam" className="img" />
      </Box>
      <Box className="text-overlay" sx={{ textAlign: 'center', color:'#00FF9C'}}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 450, color: '#DFFF3D' }}>
          <span>Hi i am Ishmam.</span>
        </Typography >
        <Typography variant="h4">
          <ReactTyped
            strings={["Software Engineer", "Tech Enthusiast", "Problem Solver", "Data Scientist"]}
            typeSpeed={25}
            backSpeed={40}
            loop
            className="typed-text"  
          />
        </Typography>
        <Typography variant="subtitle1" className='subtitle-text' sx={{color:'#ff4081' ,fontWeight: 500, marginTop: '10px' }}>
          Passionate self taught Web Application Developer, Data Scientist, Ai Application Engineer focusing on topics such as : 
        </Typography> 
        <Typography variant="subtitle1" className='subtitle-text' sx={{color:'#ff4081' ,fontWeight: 500, marginTop: '10px' }}>  
          <span role="img" aria-label="robot">🤖</span> Applications of LLMS & Multi Agent Architecture <br/>
          <span role="img" aria-label="laptop mobile">💻📱</span> Full stack web and mobile application development <br/>
          <span role="img" aria-label="data">📊🩻</span> Data Science & Natural Language Processing <br/>  
        </Typography>
      </Box>
    </Container>
  );
}

export default Hero;