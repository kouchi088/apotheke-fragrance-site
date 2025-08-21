import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative h-[calc(100vh-80px)] flex items-center justify-center text-center text-white">
        <Image
          src="/concept-main.jpg"
          alt="Concrete background"
          fill
          style={{ objectFit: 'cover' }}
          className="-z-10 brightness-50"
          priority
        />
        <div className="flex flex-col items-center">
          <h1 className="text-6xl md:text-8xl font-bold tracking-widest">MEGURID</h1>
          <p className="mt-2 text-lg md:text-xl tracking-wider">巡る季節、変わらぬ価値。</p>
          <Link href="/online-store"
            className="mt-8 px-10 py-3 border border-white hover:bg-white hover:text-black transition-colors duration-300 text-sm tracking-widest">
            EXPLORE PRODUCTS
          </Link>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">OUR PHILOSOPHY</h2>
          <p className="text-sm text-secondary mb-8">コンクリートに込められた想い</p>
          <p className="text-left leading-relaxed">
            私たちのブランドは、コンクリートという無機質な素材の中に、予期せぬ温かみと生命感を見出すことから始まりました。日本の伝統的な美意識である「わびさび」—不完全さの中にある美—にインスパイアされ、私たちは一つ一つ手作業で製品を創り出しています。ミニマリズムを追求し、静寂と調和を大切にする。それが私たちの哲学です。
          </p>
        </div>
      </section>
    </main>
  );
}
