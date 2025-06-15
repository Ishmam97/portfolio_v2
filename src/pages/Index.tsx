
import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Journey from '../components/Journey';
import Projects from '../components/Projects';
import Contact from '../components/Contact';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import { Toaster } from "@/components/ui/toaster";

const Index = () => {
  return (
    <>
      <div className="min-h-screen bg-cyber-dark">
        <Navbar />
        <Navigation />
        
        <main>
          <Hero />
          <Journey />
          <Projects />
          <Contact />
        </main>
        
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-neon-green/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-neon-yellow/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
      </div>
      
      <Footer />
      <Toaster />
    </>
  );
};

export default Index;
