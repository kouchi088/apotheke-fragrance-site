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
        className="w-full flex-grow font-mono bg-gray-100 p-2 border border-gray-300 rounded-md text-sm"
      />
      <button
        onClick={handleCopy}
        className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 whitespace-nowrap"
      >
        {copied ? 'コピー完了' : 'コピー'}
      </button>
    </div>
  );
}
