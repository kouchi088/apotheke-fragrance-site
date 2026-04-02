import type { Metadata } from 'next';
import Link from 'next/link';

import { getAllColumns } from '@/lib/columns';

export const metadata: Metadata = {
  title: 'コラム | MEGURID',
  description: 'コンクリート雑貨の選び方、素材の特徴、お手入れ方法をまとめたMEGURIDのコラム一覧です。',
};

export default function ColumnsPage() {
  const columns = getAllColumns();

  return (
    <div className="min-h-screen bg-white text-foreground">
      <section className="border-b border-accent bg-[#fafafa]">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-20">
          <p className="text-xs uppercase tracking-[0.3em] text-secondary">MEGURID Journal</p>
          <h1 className="mt-4 text-3xl md:text-5xl font-serif leading-tight">コラム</h1>
          <p className="mt-6 max-w-2xl text-sm md:text-base leading-8 text-primary">
            コンクリート雑貨の基礎知識、白華や水跡の対処、素材の見方まで。購入前と使用中の疑問に答える記事をまとめています。
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid gap-6">
          {columns.map((column) => (
            <article key={column.slug} className="border border-accent bg-white p-6 md:p-8 transition-colors hover:bg-[#fcfcfc]">
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-secondary">
                <span>Column</span>
                <span>{String(column.order).padStart(2, '0')}</span>
              </div>
              <h2 className="mt-4 text-xl md:text-2xl font-serif leading-relaxed text-foreground">
                <Link href={`/columns/${column.routeSlug}`} className="hover:text-primary transition-colors">
                  {column.title}
                </Link>
              </h2>
              <p className="mt-4 text-sm md:text-[15px] leading-7 text-primary">{column.excerpt}</p>
              <div className="mt-6">
                <Link
                  href={`/columns/${column.routeSlug}`}
                  className="inline-flex items-center border-b border-foreground pb-1 text-xs uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  Read Article
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
