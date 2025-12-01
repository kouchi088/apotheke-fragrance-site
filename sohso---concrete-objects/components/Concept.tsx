import React from 'react';

const Concept: React.FC = () => {
  return (
    <section id="concept" className="py-24 md:py-32 bg-concrete-800 text-concrete-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          <div className="w-full md:w-1/2">
             <div className="aspect-[4/5] relative overflow-hidden bg-concrete-700">
                <img 
                    src="https://picsum.photos/800/1000?blur=2&grayscale" 
                    alt="Process of making concrete" 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700 opacity-80"
                />
             </div>
          </div>

          <div className="w-full md:w-1/2 md:pl-12">
            <h2 className="text-3xl md:text-4xl font-serif mb-8 leading-snug">
              偶然が生み出す、<br/>唯一無二の表情。
            </h2>
            <div className="space-y-6 text-concrete-300 font-sans leading-loose">
                <p>
                    コンクリートは、水、砂、セメントが混ざり合い、化学反応を起こして固まる素材です。その過程で生まれる気泡（ボイド）や色むらは、決して欠陥ではありません。
                </p>
                <p>
                    それは、素材が呼吸をした証であり、二つとして同じものが存在しないことの証明です。私たちは機械的な均一さよりも、手仕事による偶然性を大切にしています。
                </p>
                <p>
                    時が経つにつれて深まる手触りと、空間に馴染んでいく静かな佇まいをお楽しみください。
                </p>
            </div>
            
            <div className="mt-12 pt-8 border-t border-concrete-600 flex justify-between items-end">
                <div>
                    <span className="block text-5xl font-serif mb-2">01</span>
                    <span className="text-sm tracking-widest uppercase text-concrete-400">Material</span>
                </div>
                 <div>
                    <span className="block text-5xl font-serif mb-2">02</span>
                    <span className="text-sm tracking-widest uppercase text-concrete-400">Process</span>
                </div>
                 <div>
                    <span className="block text-5xl font-serif mb-2">03</span>
                    <span className="text-sm tracking-widest uppercase text-concrete-400">Aging</span>
                </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Concept;