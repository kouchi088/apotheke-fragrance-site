"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-gray-200 selection:text-foreground" style={{ fontFamily: "'Noto Serif JP', 'Times New Roman', serif" }}>
      {/* --- Hero Section --- */}
      <section className="relative -mt-[78px] h-[calc(100vh+78px)] w-full overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://picsum.photos/1600/1200?grayscale&blur=1"
            alt="MEGURID ヒーロー"
            fill
            style={{ objectFit: 'cover' }}
            className="grayscale"
            priority
          />
          <div className="absolute inset-0 bg-white/30"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col justify-center items-center text-center px-6">
          <FadeIn>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium leading-tight mb-8 text-foreground tracking-[0.15em] text-center">
              MEGURI 出会う
            </h1>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="space-y-0 text-[0.8rem] md:text-sm leading-loose text-foreground font-light tracking-wide max-w-lg mx-auto mt-4">
              <p>都市の素材であるコンクリートに、手仕事の温かみを。</p>
              <p className="mt-[50px]">不揃いな気泡、独特の質感、経年変化。MEGURIDは、日常に静かな重みをもたらすインテリアオブジェを提案します。</p>
            </div>
          </FadeIn>

        </div>
      </section>

      {/* --- About us --- */}
      <section id="about" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
            <div className="md:w-1/2">
              <FadeIn>
                <h2 className="text-2xl md:text-3xl font-serif mb-10 text-foreground">私たちについて</h2>
              </FadeIn>
              <FadeIn delay={200}>
                <div className="text-[10pt] leading-normal text-gray-600 font-light space-y-8 tracking-wide text-justify">
                  <p>私たちは建築家集団です。</p>
                  <p>
                    形をつくる前に、問いを立てることから始めます。
                    光とは何か。壁とは何か。人が落ち着くとはどういうことか。
                  </p>
                  <p>
                    建築で培った視点を、手のひらに収まるスケールへ。
                    コンクリートという素朴な素材に思考を沈め、
                    生活の一角に、静かに効くプロダクトを立ち上げています。
                  </p>
                  <p>
                    目立つためではなく、空間の芯として佇むために。
                    MEGURID は、暮らしの背景に長く残るものをつくります。
                  </p>
                </div>
              </FadeIn>
            </div>

            <div className="md:w-1/2 relative h-[500px] w-full">
              <FadeIn direction="left" delay={300} className="h-full w-full">
                <div className="relative w-full h-full bg-gray-100">
                  <Image
                    src="https://picsum.photos/800/1000?random=2"
                    alt="制作風景"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="grayscale"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* --- Why Concrete --- */}
      <section id="material" className="py-32 bg-accent text-foreground relative">
        <div className="max-w-5xl mx-auto px-6">
          <FadeIn className="mb-20 text-center">
            <h2 className="text-3xl md:text-4xl font-serif tracking-wide">なぜ、コンクリートなのか。</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <FadeIn delay={200}>
              <div className="aspect-square bg-gray-200 relative overflow-hidden group shadow-lg">
                <Image
                  src="https://picsum.photos/800/800?random=4"
                  alt="コンクリートの質感"
                  fill
                  style={{ objectFit: 'cover' }}
                  className="grayscale group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="space-y-8 text-[10pt] leading-normal font-light text-gray-600 tracking-wide text-justify">
                <p>
                  コンクリートには、強さと静けさが同居しています。
                  私たちは建築の中でこの素材に出会い、図面上の記号ではなく、
                  質量や冷たさ、ざらつきといった手触りとして向き合ってきました。
                </p>
                <p>
                  コンクリートは、派手さよりも「在り方」で印象が変わる素材です。
                  背景にまわることも、空間の芯として佇むこともできる。
                  そのかっこよさと落ち着きが、いまの生活にこそ必要だと感じています。
                </p>
                <p>
                  MEGURID は、「かっこいい」と「落ち着いていられる」を同時に叶える素材として、
                  コンクリートを選び続けています。
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- Featured Products --- */}
      <section id="featured" className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <h2 className="text-2xl md:text-3xl font-serif mb-12 text-foreground">主要商品</h2>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn delay={100}>
              <div className="group">
                <Link href="/online-store" className="block">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src="https://picsum.photos/800/800?random=6"
                      alt="Incense Holder"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="mt-6">
                  <h3 className="text-lg font-serif text-foreground">Incense Holder</h3>
                  <p className="text-primary mt-2 text-[10pt] leading-normal">
                    香りの時間を、部屋の静けさとして定着させる。
                  </p>
                  <Link
                    href="/online-store"
                    className="mt-4 inline-flex items-center border-b border-foreground pb-1 text-sm tracking-widest hover:text-primary hover:border-primary transition-colors"
                  >
                    商品を見る
                  </Link>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={200}>
              <div className="group">
                <Link href="/online-store" className="block">
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src="/about_ash.png"
                      alt="Tray"
                      fill
                      style={{ objectFit: 'cover' }}
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                </Link>
                <div className="mt-6">
                  <h3 className="text-lg font-serif text-foreground">Tray</h3>
                  <p className="text-primary mt-2 text-[10pt] leading-normal">
                    散らかり方にルールを与え、視界を整えるための面。
                  </p>
                  <Link
                    href="/online-store"
                    className="mt-4 inline-flex items-center border-b border-foreground pb-1 text-sm tracking-widest hover:text-primary hover:border-primary transition-colors"
                  >
                    商品を見る
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* --- CTA --- */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-center">
            <div className="md:w-1/2">
              <FadeIn>
                <p className="text-[10pt] font-serif text-foreground leading-normal mb-8">
                  オンラインストアで、現在のラインナップをご覧ください。
                </p>
              </FadeIn>
              <FadeIn delay={200}>
                <Link href="/online-store">
                  <Button variant="outline" className="min-w-[220px]">
                    オンラインストアを見る
                  </Button>
                </Link>
              </FadeIn>
            </div>

            <div className="md:w-1/2 relative h-[500px] w-full">
              <FadeIn direction="left" delay={300} className="h-full w-full">
                <div className="relative w-full h-full bg-gray-100">
                  <Image
                    src="https://picsum.photos/800/1000?random=8"
                    alt="使用イメージ"
                    fill
                    style={{ objectFit: 'cover' }}
                    className="grayscale"
                  />
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
