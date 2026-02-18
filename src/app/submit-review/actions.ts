'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

// Helper to create a Supabase admin client
const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return createClient(supabaseUrl, serviceKey);
};

type ActionState = {
  success: boolean;
  error: string | null;
};

export async function submitUgcAction(prevState: ActionState, formData: FormData): Promise<ActionState> {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { success: false, error: '現在レビュー投稿を受け付けできません。環境設定（SUPABASE_SERVICE_ROLE_KEY）を確認してください。' };
  }

  const rawFormData = {
    email: formData.get('email') as string,
    nickname: formData.get('nickname') as string | null,
    productId: formData.get('product_id') as string,
    caption: formData.get('caption') as string | null,
    consent: formData.get('consent') as string,
  };

  // --- Validation ---
  if (!rawFormData.email || !rawFormData.productId || rawFormData.consent !== 'on') {
    return { success: false, error: '必須項目（メールアドレス、商品、利用規約への同意）が入力されていません。' };
  }

  const files = formData
    .getAll('files')
    .filter((f): f is File => f instanceof File && f.size > 0);

  // --- File Uploads ---
  const uploadedFileKeys: { key: string; url: string }[] = [];

  for (const file of files) {
    // Generate a random UUID for the file name to avoid conflicts
    const safeName = file.name.replace(/[^\w.\-]+/g, '_');
    const fileName = `${crypto.randomUUID()}-${safeName}`;
    const fileBuffer = await file.arrayBuffer();
    const { data, error } = await supabase.storage
      .from('ugc-images')
      .upload(fileName, fileBuffer, {
        contentType: file.type || 'application/octet-stream',
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: `ファイルのアップロードに失敗しました: ${error.message}` };
    }
    
    const { data: { publicUrl } } = supabase.storage.from('ugc-images').getPublicUrl(data.path);
    uploadedFileKeys.push({ key: data.path, url: publicUrl });
  }

  // --- Database Inserts ---
  try {
    // 1. Insert into ugc_submissions
    const { data: submission, error: submissionError } = await supabase
      .from('ugc_submissions')
      .insert({
        email: rawFormData.email,
        nickname: rawFormData.nickname,
        product_id: rawFormData.productId,
        caption: rawFormData.caption,
        consent_version: '1.0', // This could be dynamic in a real app
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // 2. Insert into ugc_images
    if (uploadedFileKeys.length > 0) {
      const imagesToInsert = uploadedFileKeys.map((file, index) => ({
        submission_id: submission.id,
        file_key: file.key,
        cdn_url: file.url,
        order_index: index,
      }));
      const { error: imagesError } = await supabase.from('ugc_images').insert(imagesToInsert);
      if (imagesError) throw imagesError;
    }
    
    revalidatePath('/submit-review');
    return { success: true, error: null };

  } catch (error: any) {
    console.error('Error inserting UGC data:', error);
    // In a real-world scenario, you might want to delete the uploaded files from storage here
    return { success: false, error: `データベースへの保存中にエラーが発生しました。` };
  }
}
