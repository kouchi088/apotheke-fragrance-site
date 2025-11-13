'use client';

import { useEffect, useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { submitUgcAction } from './actions';

type Product = {
  id: string;
  name: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending} 
      className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-secondary disabled:cursor-not-allowed transition-colors duration-300"
    >
      {pending ? '投稿中...' : '投稿する'}
    </button>
  );
}

export function SubmitReviewForm({ products }: { products: Product[] }) {
  const initialState = { success: false, error: null };
  const [state, formAction] = useFormState(submitUgcAction, initialState);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length > 5) {
        setFileError("写真は5枚までアップロードできます。");
        e.target.value = ''; // Reset file input
        setFiles([]);
        return;
      }
      setFiles(selectedFiles);
      setFileError(null);
    }
  };

  if (state.success) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-green-600 mb-4">投稿ありがとうございます！</h2>
        <p className="text-foreground">管理者による内容の確認後、サイトに掲載される場合があります。</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground">メールアドレス <span className="text-red-500">*</span></label>
        <input type="email" name="email" id="email" required className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary" />
      </div>

      <div>
        <label htmlFor="nickname" className="block text-sm font-medium text-foreground">ニックネーム (任意)</label>
        <input type="text" name="nickname" id="nickname" placeholder="例: megurid好き" className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary" />
      </div>

      <div>
        <label htmlFor="product_id" className="block text-sm font-medium text-foreground">商品 <span className="text-red-500">*</span></label>
        <select name="product_id" id="product_id" required defaultValue="" className="mt-1 block w-full px-3 py-2 border border-accent bg-white rounded-md shadow-sm focus:ring-primary focus:border-primary">
          <option value="" disabled>商品を選択してください</option>
          {products.map(product => (
            <option key={product.id} value={product.id}>{product.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="caption" className="block text-sm font-medium text-foreground">キャプション・感想</label>
        <textarea name="caption" id="caption" rows={4} className="mt-1 block w-full px-3 py-2 border border-accent rounded-md shadow-sm focus:ring-primary focus:border-primary"></textarea>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground">写真 (5枚まで) <span className="text-red-500">*</span></label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-accent border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <svg className="mx-auto h-12 w-12 text-secondary" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            <div className="flex text-sm text-gray-600">
              <label htmlFor="files" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-foreground focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary">
                <span>ファイルをアップロード</span>
                <input id="files" name="files" type="file" className="sr-only" multiple accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleFileChange} />
              </label>
              <p className="pl-1">またはドラッグ＆ドロップ</p>
            </div>
            <p className="text-xs text-secondary">PNG, JPG, WEBP, GIF (10MBまで)</p>
          </div>
        </div>
        {fileError && <p className="mt-2 text-sm text-red-500">{fileError}</p>}
        {files.length > 0 && (
          <div className="mt-2 text-sm text-secondary">
            選択中のファイル: {files.map(f => f.name).join(', ')}
          </div>
        )}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input id="consent" name="consent" type="checkbox" required className="focus:ring-primary h-4 w-4 text-primary border-accent rounded" />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="consent" className="font-medium text-foreground">利用規約に同意します <span className="text-red-500">*</span></label>
          <p className="text-secondary">投稿内容の利用に関する<a href="/terms" target="_blank" className="underline hover:text-foreground">規約</a>をご確認ください。</p>
        </div>
      </div>

      {state.error && <p className="text-sm font-medium text-red-600 bg-red-50 p-3 rounded-md">{state.error}</p>}

      <SubmitButton />
    </form>
  );
}