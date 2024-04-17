import React from 'react';
import './css/Hero.css'; // This will be your stylesheet for the hero component

function Hero() {
  return (
    <div className="hero">
      <div className="hero-left">
        <img src="/img/me.jpeg" alt="Ishmam" className="hero-image" />
      </div>
      <div className="hero-right">
        <h1>Hi, I'm Ishmam</h1>
      </div>
    </div>
  );
}

export default Hero;