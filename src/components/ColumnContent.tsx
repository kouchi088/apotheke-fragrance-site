import Link from 'next/link';

import type { ColumnBlock } from '@/lib/columns';

function renderInline(text: string) {
  const pattern = /(\*\*.+?\*\*|`.+?`|\[.+?\]\(.+?\))/g;
  const tokens = text.split(pattern).filter(Boolean);

  return tokens.map((token, index) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return <strong key={index} className="font-semibold text-foreground">{token.slice(2, -2)}</strong>;
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index} className="rounded bg-accent px-1.5 py-0.5 text-[0.95em] text-foreground">{token.slice(1, -1)}</code>;
    }

    const linkMatch = token.match(/^\[(.+?)\]\((.+?)\)$/);
    if (linkMatch) {
      const [, label, href] = linkMatch;
      const isInternal = href.startsWith('/');
      const className = 'underline underline-offset-4 transition-colors hover:text-foreground';

      if (isInternal) {
        return <Link key={index} href={href} className={className}>{label}</Link>;
      }

      return <a key={index} href={href} className={className} target="_blank" rel="noreferrer">{label}</a>;
    }

    return <span key={index}>{token}</span>;
  });
}

export default function ColumnContent({ blocks }: { blocks: ColumnBlock[] }) {
  return (
    <div className="space-y-7 text-[16.5px] leading-[2.05] tracking-[0.01em] text-foreground sm:space-y-8 sm:text-[17px] sm:leading-[2.1]">
      {blocks.map((block, index) => {
        if (block.type === 'hr') {
          return <hr key={index} className="my-10 border-accent" />;
        }

        if (block.type === 'heading') {
          if (block.level === 1) {
            return <h1 key={index} className="text-3xl font-serif leading-tight text-foreground md:text-4xl">{block.text}</h1>;
          }

          if (block.level === 2) {
            return <h2 key={index} className="pt-6 text-[1.7rem] font-serif leading-snug text-foreground md:text-2xl">{block.text}</h2>;
          }

          return <h3 key={index} className="text-[1.28rem] font-serif leading-snug text-foreground md:text-xl">{block.text}</h3>;
        }

        if (block.type === 'paragraph') {
          return <p key={index} className="whitespace-pre-line font-normal text-foreground/90">{renderInline(block.text)}</p>;
        }

        if (block.type === 'list') {
          const ListTag = block.ordered ? 'ol' : 'ul';

          return (
            <ListTag
              key={index}
              className={
                block.ordered
                  ? 'space-y-3 pl-5 list-decimal font-normal text-foreground/90 marker:text-foreground sm:pl-6'
                  : 'space-y-3 pl-5 list-disc font-normal text-foreground/90 marker:text-foreground sm:pl-6'
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === 'table') {
          return (
            <div key={index} className="overflow-x-auto">
              <table className="w-full border-collapse text-[15px] leading-relaxed text-foreground/90">
                <thead>
                  <tr className="border-b border-foreground/20">
                    {block.headers.map((header, i) => (
                      <th key={i} className="px-4 py-3 text-left font-semibold text-foreground">{renderInline(header)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-accent">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-3">{renderInline(cell)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote key={index} className="border-l-2 border-foreground/30 pl-5 text-foreground/80 italic">
              {block.text.split('\n').map((line, i) => (
                <p key={i} className="whitespace-pre-line">{renderInline(line)}</p>
              ))}
            </blockquote>
          );
        }

        return (
          <pre
            key={index}
            className="overflow-x-auto rounded-lg border border-accent bg-[#fafafa] px-4 py-4 text-[14px] leading-7 text-foreground sm:text-sm"
          >
            <code>{block.code}</code>
          </pre>
        );
      })}
    </div>
  );
}
