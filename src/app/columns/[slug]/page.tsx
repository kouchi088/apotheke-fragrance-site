import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import ColumnContent from '@/components/ColumnContent';
import { getAllColumns, getColumnBySlug } from '@/lib/columns';
import type { ColumnBlock } from '@/lib/columns';
import {
  buildAbsoluteUrl,
  createBreadcrumbJsonLd,
  defaultOgImage,
  formatJapaneseDate,
  siteName,
  siteUrl,
} from '@/lib/seo';

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

  const title = `${column.title} | MEGURID`;
  const description = column.excerpt;
  const url = `${siteUrl}/columns/${column.routeSlug}`;
  const heroImage = column.heroImage ? buildAbsoluteUrl(column.heroImage) : defaultOgImage;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName,
      locale: 'ja_JP',
      publishedTime: column.publishedAt,
      modifiedTime: column.updatedAt,
      images: [
        {
          url: heroImage,
          width: 1200,
          height: 630,
          alt: column.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [heroImage],
    },
  };
}

function extractFAQs(blocks: ColumnBlock[]): { question: string; answer: string }[] {
  const faqs: { question: string; answer: string }[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type !== 'paragraph') continue;
    const qMatch = block.text.match(/^\*\*Q\.\s*(.+?)\*\*/);
    if (!qMatch) continue;

    // Answer in same paragraph (after newline)
    const rest = block.text.replace(/^\*\*Q\..+?\*\*\s*/, '').trim();
    const aMatchSame = rest.match(/^A\.\s*([\s\S]+)/);
    if (aMatchSame) {
      faqs.push({ question: qMatch[1], answer: aMatchSame[1].trim() });
      continue;
    }

    // Answer in next paragraph block
    if (i + 1 < blocks.length && blocks[i + 1].type === 'paragraph') {
      const nextBlock = blocks[i + 1] as { type: 'paragraph'; text: string };
      const aMatchNext = nextBlock.text.match(/^A\.\s*([\s\S]+)/);
      if (aMatchNext) {
        faqs.push({ question: qMatch[1], answer: aMatchNext[1].trim() });
      }
    }
  }
  return faqs;
}

export default function ColumnDetailPage({ params }: ColumnPageProps) {
  const columns = getAllColumns();
  const article = getColumnBySlug(params.slug);

  if (!article) notFound();

  const currentIndex = columns.findIndex((column) => column.slug === article.slug);
  const newerArticle = currentIndex > 0 ? columns[currentIndex - 1] : null;
  const olderArticle = currentIndex >= 0 && currentIndex < columns.length - 1 ? columns[currentIndex + 1] : null;

  const faqs = extractFAQs(article.blocks);
  const articleUrl = `${siteUrl}/columns/${article.routeSlug}`;
  const heroImage = article.heroImage ? buildAbsoluteUrl(article.heroImage) : defaultOgImage;
  const contentBlocks =
    article.blocks[0]?.type === 'heading' &&
    article.blocks[0].level === 1 &&
    article.blocks[0].text.trim() === article.title.trim()
      ? article.blocks.slice(1)
      : article.blocks;
  const breadcrumbJsonLd = createBreadcrumbJsonLd([
    { name: 'ホーム', path: '/' },
    { name: 'コラム', path: '/columns' },
    { name: article.title, path: `/columns/${article.routeSlug}` },
  ]);

  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    url: articleUrl,
    author: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: siteName,
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: defaultOgImage,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': articleUrl,
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: [heroImage],
  };

  const faqJsonLd = faqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  } : null;

  return (
    <div className="min-h-screen bg-white text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
      <article className="mx-auto max-w-3xl px-6 py-10 md:px-6 md:py-16">
        <div className="mb-10 border-b border-accent pb-8">
          <nav aria-label="Breadcrumb" className="mb-6 text-[11px] uppercase tracking-[0.22em] text-secondary md:text-xs">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/columns" className="transition-colors hover:text-foreground">Columns</Link>
              </li>
              <li>/</li>
              <li className="text-foreground">{String(article.order).padStart(2, '0')}</li>
            </ol>
          </nav>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-secondary md:text-xs">
            Column {String(article.order).padStart(2, '0')}
          </p>
          <h1 className="mt-4 text-[2rem] font-serif leading-[1.35] text-foreground md:text-5xl md:leading-tight">{article.title}</h1>
          <p className="mt-6 text-[16px] leading-8 text-foreground/80 md:text-base">{article.excerpt}</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-secondary">
            <p>著者: {siteName}</p>
            <p>公開日: <time dateTime={article.publishedAt}>{formatJapaneseDate(article.publishedAt)}</time></p>
            <p>更新日: <time dateTime={article.updatedAt}>{formatJapaneseDate(article.updatedAt)}</time></p>
          </div>
        </div>

        <ColumnContent blocks={contentBlocks} />

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
