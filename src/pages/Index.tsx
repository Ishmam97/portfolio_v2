
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
      <div className="relative min-h-screen bg-cyber-dark overflow-hidden">
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(97,218,251,0.28),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(197,146,255,0.32),transparent_36%),radial-gradient(circle_at_70%_80%,rgba(0,255,156,0.24),transparent_38%)] animate-pulse" />
          <div className="absolute inset-0 opacity-90 [background-image:linear-gradient(rgba(0,255,156,0.3)_1.5px,transparent_1.5px),linear-gradient(90deg,rgba(197,146,255,0.32)_1.5px,transparent_1.5px),repeating-linear-gradient(45deg,rgba(223,255,61,0.26)_0_1.6px,transparent_1.6px_22px),repeating-linear-gradient(-45deg,rgba(255,64,129,0.24)_0_1.6px,transparent_1.6px_24px)] [background-size:58px_58px,58px_58px,132px_132px,136px_136px] [background-position:0_0,0_0,10px_14px,-8px_12px]" />
          <div className="absolute inset-0 backdrop-blur-[8px] bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_80%_25%,rgba(255,255,255,0.18),transparent_38%),radial-gradient(circle_at_60%_80%,rgba(255,255,255,0.16),transparent_40%),repeating-radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.07)_0_1px,transparent_1px_3px)] mix-blend-screen opacity-65" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(197,146,255,0.28)_45%,rgba(97,218,251,0.2)_56%,transparent_66%)] animate-[flicker_7s_infinite]" />
        </div>
        <div className="relative z-10">
          <Navbar />
          <Navigation />
        
          <main>
            <Hero />
            <Journey />
            <Projects />
            <Contact />
          </main>
        </div>
        
        {/* Background Effects */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
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
