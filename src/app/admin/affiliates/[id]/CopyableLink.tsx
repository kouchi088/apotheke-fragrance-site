'use client';

import { useState } from 'react';

export function CopyableLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  return (
    <div className="flex items-center gap-2">
      <input 
        type="text" 
        value={url} 
        readOnly 
        className="w-full flex-grow font-mono bg-accent/50 p-2 border border-accent rounded-md text-sm text-foreground"
      />
      <button
        onClick={handleCopy}
        className="px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-foreground transition-colors duration-300 whitespace-nowrap"
      >
        {copied ? 'コピー完了' : 'コピー'}
      </button>
    </div>
  );
}