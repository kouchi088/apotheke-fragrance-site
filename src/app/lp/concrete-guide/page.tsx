"use client";

import Image from 'next/image';
import Link from 'next/link';
import FadeIn from '@/components/FadeIn';

export default function ConcreteGuideLP() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent selection:text-foreground">
      
      {/* --- Hero Section --- */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://picsum.photos/1600/900?grayscale&blur=2" 
            alt="Concrete texture" 
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        <div className="relative z-10 text-center px-6">
          <FadeIn>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-medium mb-4 tracking-widest">
              Concrete Guide
            </h1>
            <p className="text-sm md:text-base tracking-[0.2em] uppercase opacity-90">
              コンクリート雑貨 完全ガイド
            </p>
          </FadeIn>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-6 py-24">
        
        {/* --- Intro --- */}
        <FadeIn delay={200}>
          <section className="mb-24 text-center">
            <p className="text-lg md:text-xl leading-loose font-light text-primary">
              素材の特性・魅力・弱点・メンテナンスまで。<br className="hidden md:block"/>
              長く愛用していただくための、コンクリートの基礎知識。
            </p>
          </section>
        </FadeIn>

        {/* --- Chapter 1: Understanding --- */}
        <section className="mb-24">
          <FadeIn>
            <div className="flex items-baseline border-b border-accent pb-4 mb-10">
              <span className="text-4xl font-serif mr-4 text-gray-button">01</span>
              <h2 className="text-2xl font-serif text-foreground">コンクリートという素材を正しく理解する</h2>
            </div>
          </FadeIn>
          
          <FadeIn delay={200}>
            <div className="space-y-8 text-primary leading-loose">
              <p>
                コンクリートは、セメント・水・骨材（細かな石成分） を基材とした素材で、硬化後に独自の質感と重量感を持ちます。
                建築材料という認識が強い一方、実際には <span className="font-bold text-foreground">小物・インテリア雑貨に非常に適した素材</span> でもあります。
              </p>
              <div className="bg-accent p-8 rounded-sm">
                <h3 className="text-sm font-bold tracking-widest mb-4 uppercase text-gray-button">Why Concrete?</h3>
                <ul className="list-none space-y-4">
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">●</span>
                    <span><span className="font-bold text-foreground">重さ（比重）</span>：安定性があり、鍵・アクセサリーなどの小物を置いてもズレない。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">●</span>
                    <span><span className="font-bold text-foreground">表面テクスチャ</span>：マットで静かな質感。光を反射しにくく、空間に馴染む。</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-3 text-foreground">●</span>
                    <span><span className="font-bold text-foreground">経年変化</span>：使い込むほどに“濃淡”が生き、表情が豊かになる。</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-secondary">
                ※ただし、吸水性や白華（エフロレッセンス）、微細な気孔といった「素材としての特性」も理解しておく必要があります。
              </p>
            </div>
          </FadeIn>
        </section>

        {/* --- Chapter 2: Charm --- */}
        <section className="mb-24">
          <FadeIn>
            <div className="flex items-baseline border-b border-accent pb-4 mb-10">
              <span className="text-4xl font-serif mr-4 text-gray-button">02</span>
              <h2 className="text-2xl font-serif text-foreground">コンクリート雑貨の“魅力”が生まれる理由</h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <FadeIn delay={200}>
              <div className="relative h-64 mb-6 bg-accent">
                 <Image 
                    src="https://picsum.photos/600/400?random=10" 
                    alt="Minimalist texture" 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="grayscale opacity-80"
                  />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">ミニマルで“ノイズが少ない”</h3>
              <p className="text-primary leading-loose text-sm">
                コンクリートの表面は反射を抑えた微細な凹凸で構成され、光沢を主張しません。
                金属やガラスと比べて、空間の中で主張しすぎず、背景と自然に融けるのが特徴です。
              </p>
            </FadeIn>

            <FadeIn delay={400}>
              <div className="relative h-64 mb-6 bg-accent">
                 <Image 
                    src="https://picsum.photos/600/400?random=11" 
                    alt="Unique patterns" 
                    fill
                    style={{ objectFit: 'cover' }}
                    className="grayscale opacity-80"
                  />
              </div>
              <h3 className="text-lg font-bold mb-3 text-foreground">個体差・色むらが“一点物らしさ”</h3>
              <p className="text-primary leading-loose text-sm">
                完全均一を求める素材ではないからこそ、微細なテクスチャの違い・濃淡の変化 が、使用者だけの表情となります。
              </p>
            </FadeIn>
          </div>
        </section>

        {/* --- Chapter 3: Weakness & Solutions --- */}
        <section className="mb-24">
          <FadeIn>
            <div className="flex items-baseline border-b border-accent pb-4 mb-10">
              <span className="text-4xl font-serif mr-4 text-gray-button">03</span>
              <h2 className="text-2xl font-serif text-foreground">弱点と、その“設計による解消”</h2>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="space-y-12">
              <div>
                <h3 className="text-xl font-serif mb-4 text-foreground">吸水性と輪染み</h3>
                <p className="text-primary leading-loose mb-4">
                  コンクリートは本質的に吸水性があります。水滴や手汗の跡が残る場合がありますが、これは素材の性質です。
                </p>
                <div className="bg-white border border-accent p-6">
                  <p className="font-bold text-sm mb-2 text-foreground">対策：撥水仕上げ / シーラー処理</p>
                  <p className="text-sm text-primary">
                    表面に浸透・または薄い皮膜を作ることで、吸水を大幅に軽減できます。
                    半艶仕上げ（軽い皮膜で輪じみを抑える）や、マット仕上げ（浸透系で自然な質感を残す）などで対策しています。
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-serif mb-4 text-foreground">白華（エフロレッセンス）</h3>
                <p className="text-primary leading-loose mb-4">
                  コンクリート内部の可溶成分が表面に移動し、白い析出物になる現象です。
                  <span className="border-b border-gray-300">建築でも数十年以上語られる“非常に一般的な現象”</span>で、強度に影響はありません。
                </p>
                <div className="bg-white border border-accent p-6">
                  <p className="font-bold text-sm mb-2 text-foreground">対策</p>
                  <ul className="list-disc list-inside text-sm text-primary space-y-1">
                    <li>乾湿差を減らす（長時間の水濡れを避ける）</li>
                    <li>撥水処理で表面の水浸透を抑える</li>
                    <li>出た場合は乾拭き、または非常に薄い再仕上げで軽減</li>
                  </ul>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- Chapter 4: Selection --- */}
        <section className="mb-24">
          <FadeIn>
            <div className="flex items-baseline border-b border-accent pb-4 mb-10">
              <span className="text-4xl font-serif mr-4 text-gray-button">04</span>
              <h2 className="text-2xl font-serif text-foreground">仕上げの選び方</h2>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-foreground text-foreground">
                    <th className="py-4 px-4 font-serif tracking-wider">仕上げ</th>
                    <th className="py-4 px-4 font-serif tracking-wider">特徴</th>
                    <th className="py-4 px-4 font-serif tracking-wider">向いている人</th>
                  </tr>
                </thead>
                <tbody className="text-primary">
                  <tr className="border-b border-accent hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4 font-bold">マット</td>
                    <td className="py-4 px-4">素材の質感が最も自然／色むらが出やすい</td>
                    <td className="py-4 px-4">無垢な表情を楽しみたい人</td>
                  </tr>
                  <tr className="border-b border-accent hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4 font-bold">半艶</td>
                    <td className="py-4 px-4">水跡に強い／輪じみ軽減</td>
                    <td className="py-4 px-4">実用性と美観の両立を求める人</td>
                  </tr>
                  <tr className="border-b border-accent hover:bg-accent/30 transition-colors">
                    <td className="py-4 px-4 font-bold">フルシーラー</td>
                    <td className="py-4 px-4">汚れに最も強い／質感がやや変わる</td>
                    <td className="py-4 px-4">実用性優先の人</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </FadeIn>
        </section>

        {/* --- Chapter 5: Maintenance --- */}
        <section className="mb-24">
          <FadeIn>
            <div className="flex items-baseline border-b border-accent pb-4 mb-10">
              <span className="text-4xl font-serif mr-4 text-gray-button">05</span>
              <h2 className="text-2xl font-serif text-foreground">日々のお手入れと長期的なメンテナンス</h2>
            </div>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-accent p-8">
                <h3 className="text-lg font-serif mb-4 text-foreground">日常ケア</h3>
                <ul className="list-disc list-inside text-primary space-y-2 text-sm leading-relaxed">
                  <li>柔らかい布で乾拭き</li>
                  <li>汚れた場合は中性洗剤を薄めて拭き取り</li>
                  <li>グラス類は長時間置きっぱなしにしない</li>
                </ul>
              </div>
              <div className="bg-accent p-8">
                <h3 className="text-lg font-serif mb-4 text-foreground">定期メンテナンス</h3>
                <ul className="list-disc list-inside text-primary space-y-2 text-sm leading-relaxed">
                  <li>撥水効果が薄れたら、軽い再施工で復活</li>
                  <li>白華が出た場合は、乾拭き→再仕上げでほぼ解消</li>
                </ul>
              </div>
            </div>
          </FadeIn>
        </section>

        {/* --- FAQ --- */}
        <section className="mb-24">
          <FadeIn>
            <h2 className="text-2xl font-serif text-center mb-12 text-foreground">Q&A (FAQ)</h2>
          </FadeIn>
          
          <div className="space-y-6">
            <FadeIn delay={100}>
              <div className="border-b border-accent pb-6">
                <p className="font-bold text-foreground mb-2">Q. 白華は不良ですか？</p>
                <p className="text-sm text-primary leading-relaxed">A. 不良ではありません。コンクリートの性質による「自然現象」で、強度にも影響しません。</p>
              </div>
            </FadeIn>
            <FadeIn delay={200}>
              <div className="border-b border-accent pb-6">
                <p className="font-bold text-foreground mb-2">Q. 水跡は必ず残りますか？</p>
                <p className="text-sm text-primary leading-relaxed">A. 撥水仕上げにより大幅に軽減できます。完全に“ゼロ”にはできませんが、実用上はほぼ問題なし。</p>
              </div>
            </FadeIn>
            <FadeIn delay={300}>
              <div className="border-b border-accent pb-6">
                <p className="font-bold text-foreground mb-2">Q. 食品を置けますか？</p>
                <p className="text-sm text-primary leading-relaxed">A. 基本は推奨しません（雑貨・インテリア用途のため）。</p>
              </div>
            </FadeIn>
            <FadeIn delay={400}>
              <div className="border-b border-accent pb-6">
                <p className="font-bold text-foreground mb-2">Q. 落としても割れませんか？</p>
                <p className="text-sm text-primary leading-relaxed">A. 一般的な使用では十分な耐久性がありますが、薄肉デザイン・角部への衝撃には注意が必要です。</p>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* --- Summary --- */}
        <section className="text-center py-12 bg-accent/50 rounded-sm">
          <FadeIn>
            <h2 className="text-2xl font-serif mb-6 text-foreground">まとめ</h2>
            <p className="text-primary leading-loose mb-8">
              コンクリートは、温度のない静かな佇まいと、経年で深まる質感が魅力です。<br />
              その一方で、吸水性や白華といった“自然な性格”もあります。<br />
              これらを理解して選び、適切に使えば、<br />
              他の素材にはない落ち着きと空気感を持つ雑貨として長く楽しむことができます。
            </p>
            <Link href="/online-store" className="inline-block border border-foreground px-8 py-3 text-sm tracking-widest hover:bg-foreground hover:text-white transition-colors">
              商品を探す
            </Link>
          </FadeIn>
        </section>

      </div>
    </div>
  );
}
