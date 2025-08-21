import { createClient } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient();

// お気に入りを取得
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// お気に入りに追加
export async function POST(req: NextRequest) {
  const { userId, productId } = await req.json();

  if (!userId || !productId) {
    return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, product_id: productId }])
    .select();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// お気に入りから削除
export async function DELETE(req: NextRequest) {
  const { userId, productId } = await req.json();

  if (!userId || !productId) {
    return NextResponse.json({ error: 'User ID and Product ID are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('user_favorites')
    .delete()
    .eq('user_id', userId)
    .eq('product_id', productId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'Favorite removed successfully' });
}