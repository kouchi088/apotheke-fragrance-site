"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

// --- Button Component ---
const Button = ({ variant = 'primary', className = '', children, ...props }: any) => {
  const baseStyle = "px-8 py-4 text-sm tracking-widest transition-all duration-300 ease-out font-medium inline-block text-center";
  
  const variants: any = {
    primary: "bg-transparent border border-gray-button text-foreground hover:bg-gray-button hover:text-white",
    outline: "bg-transparent border border-foreground text-foreground hover:bg-foreground hover:text-white",
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default function ConceptPage() {
  return (
    <div className="min-h-screen bg-white text-foreground font-sans selection:bg-gray-200 selection:text-foreground">
      
      {/* --- Hero Section --- */}
      <section className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/1600/1200?grayscale&blur=1" 
            alt="Background texture" 
            fill 
            style={{ objectFit: 'cover' }}
            className="grayscale"
            priority
          />
          {/* Overlay for readability */}
          <div className="absolute inset-0 bg-white/30"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <FadeIn>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight mb-8 text-foreground bg-white/80 p-6 backdrop-blur-sm inline-block">
              ただ、そこに<br />
              い続けるためのもの。
            </h2>
          </FadeIn>
          
          <FadeIn delay={200}>
            <div className="space-y-6 text-sm md:text-base leading-loose text-foreground font-light tracking-wide max-w-lg mx-auto bg-white/80 p-8 backdrop-blur-sm mt-8">
              <p>
                MEGURIDは、コンクリートという素朴な素材で、日常の風景に「静けさ」と「落ち着き」を添えるプロダクトを作っています。
              </p>
              <p>
                強く主張するのではなく、ただそこにいる。<br />
                ふと目が止まった時、コンクリートの重さが、強さが、部屋を整える存在であること。
              </p>
              <p>
                そのささやかな役割を、一つ一つの形に任せています。
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={400} className="mt-12">
            <Link href="/online-store">
              <Button variant="primary" className="bg-white/80 hover:bg-gray-button hover:text-white">ラインナップを見る</Button>
            </Link>
          </FadeIn>
        </div>
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce opacity-50 text-foreground">
          <span className="text-[10px] tracking-widest uppercase mb-2">Scroll</span>
          <div className="w-[1px] h-12 bg-foreground"></div>
        </div>
      </section>

      {/* --- Values Section (Philosophy) --- */}
      <section id="philosophy" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
            
            <div className="md:w-1/2">
              <FadeIn>
                <span className="block text-xs font-bold tracking-[0.2em] text-gray-400 mb-6 uppercase">
                  Philosophy
                </span>
                <h3 className="text-2xl md:text-3xl font-serif mb-10 text-foreground">
                  MEGURIDが<br />大切にしていること
                </h3>
              </FadeIn>
              
              <FadeIn delay={200}>
                <div className="text-sm md:text-base leading-loose text-gray-600 font-light space-y-8 tracking-wide text-justify">
                  <p>
                    メグリッドが目指しているもの。<br/>
                    生活の中で使う物は、便利さや分かりやすい機能だけで選ぶこともできます。しかし、部屋の中で長く付き合っていきたいものには、もう少し違う基準があってもいいと私たちは考えています。
                  </p>
                  <p>
                    毎日見るからこそ落ち着きがとる。そこにあるだけで、空気が少し落ち着いて感じられること。使い込むほど、持ち主の時間がゆっくりと刻まれていくこと。
                  </p>
                  <p>
                    MEGURIDのプロダクトは、そうした「長くそばに置いておきたい感覚」を軸にデザインされています。何かを主張するためではなく、生活の背景に静かに居続けることで、持ち主の時間を支えるような存在でありたいと考えています。
                  </p>
                </div>
              </FadeIn>
            </div>

            <div className="md:w-1/2 relative h-[500px] w-full">
               <FadeIn direction="left" delay={300} className="h-full w-full">
                  <div className="relative w-full h-full bg-gray-100">
                    <Image 
                        src="https://picsum.photos/800/1000?random=2" 
                        alt="Lifestyle image" 
                        fill
                        style={{ objectFit: 'cover' }}
                        className="grayscale"
                    />
                    <div className="absolute bottom-0 right-0 bg-white p-6 shadow-sm max-w-xs hidden md:block">
                        <p className="text-xs tracking-widest text-gray-400 leading-relaxed italic">
                            &quot;Silence in the noise.&quot;
                        </p>
                    </div>
                  </div>
               </FadeIn>
            </div>

          </div>
        </div>
      </section>

      {/* --- Material Section --- */}
      <section id="material" className="py-32 bg-accent text-foreground relative">
        <div className="max-w-5xl mx-auto px-6">
          
          <FadeIn className="mb-20 text-center">
               <span className="block text-xs font-bold tracking-[0.2em] text-gray-500 mb-6 uppercase">
                  Material
                </span>
              <h3 className="text-3xl md:text-4xl font-serif tracking-wide">
                  なぜ、コンクリートなのか。
              </h3>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <FadeIn delay={200}>
                  <div className="aspect-square bg-gray-200 relative overflow-hidden group shadow-lg">
                       <Image 
                          src="https://picsum.photos/800/800?random=4" 
                          alt="Concrete texture macro" 
                          fill
                          style={{ objectFit: 'cover' }}
                          className="grayscale group-hover:scale-105 transition-transform duration-700 ease-out"
                      />
                  </div>
              </FadeIn>

              <FadeIn delay={400}>
                  <div className="space-y-8 text-sm md:text-base leading-loose font-light text-gray-600 tracking-wide text-justify">
                      <p>
                          コンクリートの物質は多くの魅力を孕んでいます。私たちが建築を学ぶなかで、図面の中の記号としてだけでなく、この素材に向き合い多くのことを感じてきました。
                      </p>
                      <p>
                          実際の建築を見に行ったときに感じる質量や、自分たちの手で小さな試験体を打ったときの冷たさ・ざらつきに、強さ、重さ、硬さに少しずつ魅了されてきました。
                      </p>
                      <p>
                          コンクリートという派手さより「在り方」で印象を変える素材は無機質でありながら、どこか落ち着きをとい、そっと背景に回ることも、空間の芯として佇むこともできる。そのかっこよさと静けさが同居している感じが、今の生活にこそ必要なものだと私たちは感じています。
                      </p>
                      <p>
                          MEGURIDのプロダクトは、建築の中でコンクリートと出会い、触れ合いながらその魅力に惹かれてきた延長線上に生まれたものです。「かっこいい」と「落ち着いていられる」を同時に叶えられる素材として、私たちはコンクリートを選び続けています。
                      </p>
                  </div>
              </FadeIn>
          </div>

        </div>
      </section>

      {/* --- Footer CTA Section --- */}
      <section className="py-32 bg-white flex flex-col items-center justify-center text-center px-6">
        <FadeIn direction="up">
          <div className="max-w-2xl mx-auto space-y-8 mb-16">
            <p className="text-lg md:text-xl font-serif text-foreground leading-relaxed">
              部屋の中で、特別に目立つわけではないけれど、<br />
              いないと少し物足りなく感じるもの。
            </p>
            <p className="text-base text-gray-600 leading-relaxed font-light">
              MEGURID のプロダクトが、そんなポジションを引き受けられたら嬉しく思います。<br /><br />
              ひとつの形を選び、手元に迎え入れるところから、<br />
              このブランドとの時間が始まります。
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={200} className="flex flex-col md:flex-row gap-6">
          <Link href="/online-store">
            <Button variant="outline" className="min-w-[200px]">
              ラインナップを見る
            </Button>
          </Link>
          <Link href="/online-store">
            <Button variant="primary" className="min-w-[200px] shadow-lg shadow-gray-200">
              オンラインストアへ
            </Button>
          </Link>
        </FadeIn>
      </section>

    </div>
  );
}
