import React from 'react';
import { ArrowRight } from './Icons';

const Hero: React.FC = () => {
  return (
    <section className="relative h-screen w-full overflow-hidden flex flex-col md:flex-row bg-concrete-100">
      
      {/* Left Content */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center px-8 md:px-24 bg-concrete-50 z-10 relative">
        <div className="animate-fade-in-up">
            <span className="text-xs font-bold tracking-[0.3em] text-concrete-400 uppercase mb-4 block">
                Handcrafted Concrete
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-concrete-900 leading-tight mb-8">
                静寂を、<br />
                形にする。
            </h1>
            <p className="text-concrete-600 mb-10 leading-relaxed font-sans max-w-md">
                都市の素材であるコンクリートに、手仕事の温かみを。
                不揃いな気泡、独特の質感、経年変化。
                SOHSOは、日常に静かな重みをもたらすインテリアオブジェを提案します。
            </p>
            <a 
                href="#products" 
                className="group inline-flex items-center space-x-3 text-concrete-900 border-b border-concrete-900 pb-1 hover:text-concrete-600 hover:border-concrete-600 transition-all"
            >
                <span className="text-sm tracking-widest uppercase">View Collection</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </a>
        </div>
      </div>

      {/* Right Image */}
      <div className="w-full md:w-1/2 h-1/2 md:h-full relative">
        <div className="absolute inset-0 bg-black/5 z-10"></div>
        <img 
            src="https://picsum.photos/1000/1200?grayscale" 
            alt="Concrete vase detail" 
            className="w-full h-full object-cover"
        />
        
        {/* Decorative Element */}
        <div className="absolute bottom-10 right-10 z-20 hidden md:block">
            <div className="w-24 h-24 border border-white/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                <div className="text-white text-xs tracking-widest animate-spin-slow">
                    EST 2024
                </div>
            </div>
        </div>
      </div>

    </section>
  );
};

export default Hero;