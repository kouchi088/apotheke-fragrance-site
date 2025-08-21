import Image from 'next/image';

export default function ConceptPage() {
  return (
    <main className="bg-background">
      <div className="container mx-auto max-w-4xl py-16 px-4">
        
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-wider">OUR CONCEPT</h1>
          <p className="text-secondary text-sm mt-2">私たちの哲学</p>
        </section>

        <section className="mb-16">
          <div className="relative w-full h-96 bg-accent">
            <Image 
              src="/concept-main.jpg"
              alt="Brand concept image"
              fill
              style={{ objectFit: 'cover' }}
              className="shadow-md"
            />
          </div>
        </section>

        <section className="max-w-2xl mx-auto space-y-6 text-left leading-relaxed text-primary">
          <p>
            <span className="text-lg font-bold text-foreground">MEGURID</span>は、日常の中に静かに佇み、時と共に深みを増すような、普遍的な美しさを持つプロダクトを創造するブランドです。
          </p>
          <p>
            私たちは、素材そのものが持つ本来の魅力を最大限に引き出し、丁寧な手仕事によって、生活を豊かにするアートピースへと昇華させることを目指しています。
          </p>
          <p>
            一つ一つ異なる表情を見せるプロダクトの風合い、そして、使う人と共に変化していくその姿をお楽しみください。私たちのプロダクトが、あなたの空間に新たなインスピレーションをもたらすことを願っています。
          </p>
        </section>

      </div>
    </main>
  );
}