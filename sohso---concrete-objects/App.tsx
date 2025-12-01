import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Concept from './components/Concept';
import FeaturedProducts from './components/FeaturedProducts';
import Footer from './components/Footer';

function App() {
  return (
    <div className="antialiased selection:bg-concrete-300 selection:text-concrete-900">
      <Navbar />
      <main>
        <Hero />
        <Concept />
        <FeaturedProducts />
      </main>
      <Footer />
    </div>
  );
}

export default App;