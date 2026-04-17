import 'server-only';

import fs from 'node:fs';
import path from 'node:path';

export type ColumnBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' };

export type ColumnSummary = {
  slug: string;
  routeSlug: string;
  title: string;
  excerpt: string;
  order: number;
  publishedAt: string;
  updatedAt: string;
  heroImage?: string | null;
};

export type ColumnArticle = ColumnSummary & {
  content: string;
  blocks: ColumnBlock[];
};

const columnsDirectory = path.join(process.cwd(), 'columns-v2');
const defaultColumnHeroImage = '/journal_top.png';

function normalizeValue(value: string) {
  return value.normalize('NFC');
}

function getOrderFromFileName(fileName: string) {
  const match = fileName.match(/^(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getSlugFromFileName(fileName: string) {
  return normalizeValue(fileName.replace(/\.md$/i, ''));
}

function getRouteSlug(order: number) {
  return String(order).padStart(2, '0');
}

function getTitleFromContent(content: string, slug: string) {
  const match = content.match(/^#\s+(.+)$/m);
  if (match) return match[1].trim();
  return slug.replace(/^\d+_?/, '').replace(/_/g, ' ').trim();
}

function stripMarkdown(text: string) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\((.+?)\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/^\s*[-*]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/^\s*>+\s?/gm, '')
    .trim();
}

function parseMarkdown(content: string): ColumnBlock[] {
  const normalized = content.replace(/\r\n/g, '\n');
  const lines = normalized.split('\n');
  const blocks: ColumnBlock[] = [];
  let index = 0;

  const flushParagraph = (buffer: string[]) => {
    if (buffer.length === 0) return;
    const text = buffer.join('\n').trim();
    if (text) blocks.push({ type: 'paragraph', text });
    buffer.length = 0;
  };

  const paragraphBuffer: string[] = [];

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      flushParagraph(paragraphBuffer);
      index += 1;
      continue;
    }

    if (trimmed.startsWith('```')) {
      flushParagraph(paragraphBuffer);
      index += 1;
      const codeLines: string[] = [];
      while (index < lines.length && lines[index].trim() !== '```') {
        codeLines.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: 'code', code: codeLines.join('\n').trim() });
      index += 1;
      continue;
    }

    if (trimmed === '---') {
      flushParagraph(paragraphBuffer);
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph(paragraphBuffer);
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        text: headingMatch[2].trim(),
      });
      index += 1;
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (unorderedMatch) {
      flushParagraph(paragraphBuffer);
      const items: string[] = [];
      while (index < lines.length) {
        const listMatch = lines[index].trim().match(/^[-*]\s+(.+)$/);
        if (!listMatch) break;
        items.push(listMatch[1].trim());
        index += 1;
      }
      blocks.push({ type: 'list', ordered: false, items });
      continue;
    }

    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (orderedMatch) {
      flushParagraph(paragraphBuffer);
      const items: string[] = [];
      while (index < lines.length) {
        const listMatch = lines[index].trim().match(/^\d+\.\s+(.+)$/);
        if (!listMatch) break;
        items.push(listMatch[1].trim());
        index += 1;
      }
      blocks.push({ type: 'list', ordered: true, items });
      continue;
    }

    // Table: pipe-delimited with separator line
    if (/^\|.+\|$/.test(trimmed) && index + 1 < lines.length) {
      const nextTrimmed = lines[index + 1].trim();
      if (/^\|[\s\-:|]+\|$/.test(nextTrimmed)) {
        flushParagraph(paragraphBuffer);
        const headers = trimmed
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim());
        index += 2; // skip header + separator
        const tableRows: string[][] = [];
        while (index < lines.length && /^\|.+\|$/.test(lines[index].trim())) {
          const row = lines[index]
            .trim()
            .slice(1, -1)
            .split('|')
            .map((cell) => cell.trim());
          tableRows.push(row);
          index += 1;
        }
        blocks.push({ type: 'table', headers, rows: tableRows });
        continue;
      }
    }

    // Blockquote: lines starting with >
    if (trimmed.startsWith('> ') || trimmed === '>') {
      flushParagraph(paragraphBuffer);
      const quoteLines: string[] = [];
      while (index < lines.length) {
        const qt = lines[index].trim();
        if (qt.startsWith('> ')) {
          quoteLines.push(qt.slice(2));
          index += 1;
        } else if (qt === '>') {
          quoteLines.push('');
          index += 1;
        } else {
          break;
        }
      }
      blocks.push({ type: 'blockquote', text: quoteLines.join('\n').trim() });
      continue;
    }

    paragraphBuffer.push(trimmed);
    index += 1;
  }

  flushParagraph(paragraphBuffer);
  return blocks;
}

function createColumnArticle(fileName: string): ColumnArticle {
  const fullPath = path.join(columnsDirectory, fileName);
  const content = fs.readFileSync(fullPath, 'utf8');
  const stats = fs.statSync(fullPath);
  const slug = getSlugFromFileName(fileName);
  const title = getTitleFromContent(content, slug);
  const blocks = parseMarkdown(content);
  const firstParagraph = blocks.find(
    (block): block is Extract<ColumnBlock, { type: 'paragraph' }> => block.type === 'paragraph',
  );

  return {
    slug,
    routeSlug: getRouteSlug(getOrderFromFileName(fileName)),
    title,
    excerpt: stripMarkdown(firstParagraph?.text ?? '').slice(0, 160),
    order: getOrderFromFileName(fileName),
    publishedAt: stats.birthtime.toISOString(),
    updatedAt: stats.mtime.toISOString(),
    heroImage: defaultColumnHeroImage,
    content,
    blocks,
  };
}

function getColumnFiles() {
  if (!fs.existsSync(columnsDirectory)) return [];

  return fs
    .readdirSync(columnsDirectory)
    .filter((fileName) => fileName.endsWith('.md'))
    .sort((a, b) => getOrderFromFileName(b) - getOrderFromFileName(a) || a.localeCompare(b, 'ja'));
}

export function getAllColumns(): ColumnSummary[] {
  return getColumnFiles().map((fileName) => {
    const article = createColumnArticle(fileName);
    return {
      slug: article.slug,
      routeSlug: article.routeSlug,
      title: article.title,
      excerpt: article.excerpt,
      order: article.order,
      publishedAt: article.publishedAt,
      updatedAt: article.updatedAt,
      heroImage: article.heroImage,
    };
  });
}

export function getLatestColumn(): ColumnSummary | null {
  const [latest] = getAllColumns();
  return latest ?? null;
}

export function getColumnBySlug(slug: string): ColumnArticle | null {
  const decodedSlug = (() => {
    try {
      return normalizeValue(decodeURIComponent(slug));
    } catch {
      return normalizeValue(slug);
    }
  })();

  const fileName = getColumnFiles().find((candidate) => {
    const order = getOrderFromFileName(candidate);
    return getSlugFromFileName(candidate) === decodedSlug || getRouteSlug(order) === decodedSlug;
  });
  if (!fileName) return null;
  return createColumnArticle(fileName);
}
