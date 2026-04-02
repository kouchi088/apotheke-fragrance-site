import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ColumnContent from '@/components/ColumnContent';
import { getAllColumns, getColumnBySlug } from '@/lib/columns';

type ColumnPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return getAllColumns().map((column) => ({
    slug: column.routeSlug,
  }));
}

export function generateMetadata({ params }: ColumnPageProps): Metadata {
  const column = getColumnBySlug(params.slug);

  if (!column) {
    return {
      title: 'コラム | MEGURID',
    };
  }

  return {
    title: `${column.title} | MEGURID`,
    description: column.excerpt,
  };
}

export default function ColumnDetailPage({ params }: ColumnPageProps) {
  const columns = getAllColumns();
  const article = getColumnBySlug(params.slug);

  if (!article) notFound();

  const currentIndex = columns.findIndex((column) => column.slug === article.slug);
  const newerArticle = currentIndex > 0 ? columns[currentIndex - 1] : null;
  const olderArticle = currentIndex >= 0 && currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null;

  return (
    <div className="min-h-screen bg-white text-foreground">
      <article className="mx-auto max-w-3xl px-6 py-10 md:px-6 md:py-16">
        <div className="mb-10 border-b border-accent pb-8">
          <Link href="/columns" className="text-[11px] uppercase tracking-[0.24em] text-secondary transition-colors hover:text-foreground md:text-xs">
            Back to Columns
          </Link>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-secondary md:text-xs">
            Column {String(article.order).padStart(2, '0')}
          </p>
          <h1 className="mt-4 text-[2rem] font-serif leading-[1.35] text-foreground md:text-5xl md:leading-tight">{article.title}</h1>
          <p className="mt-6 text-[16px] leading-8 text-foreground/80 md:text-base">{article.excerpt}</p>
        </div>

        <ColumnContent blocks={article.blocks} />

        <div className="mt-16 border-t border-accent pt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="min-h-[84px] border border-accent p-5">
              {newerArticle ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-secondary md:text-xs">Newer</p>
                  <Link href={`/columns/${newerArticle.routeSlug}`} className="mt-3 block text-[15px] leading-7 text-foreground transition-colors hover:text-primary md:text-sm">
                    {newerArticle.title}
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-secondary md:text-xs">Newer</p>
                  <p className="mt-3 text-[15px] leading-7 text-secondary md:text-sm">これが最新のコラムです。</p>
                </>
              )}
            </div>
            <div className="min-h-[84px] border border-accent p-5">
              {olderArticle ? (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-secondary md:text-xs">Older</p>
                  <Link href={`/columns/${olderArticle.routeSlug}`} className="mt-3 block text-[15px] leading-7 text-foreground transition-colors hover:text-primary md:text-sm">
                    {olderArticle.title}
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-secondary md:text-xs">Older</p>
                  <p className="mt-3 text-[15px] leading-7 text-secondary md:text-sm">これが最初のコラムです。</p>
                </>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
