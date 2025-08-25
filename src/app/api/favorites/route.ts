import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

// お気に入りを取得 (安全な方法)
export async function GET(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { data, error } = await supabase
    .from('user_favorites')
    .select('product_id')
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// お気に入りに追加 (安全な方法)
export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('user_favorites')
    .insert([{ user_id: userId, product_id: productId }])
    .select();

  if (error) {
    // Handle potential duplicate entry error gracefully
    if (error.code === '23505') { // unique constraint violation
      return NextResponse.json({ message: 'Item already in favorites' }, { status: 200 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// お気に入りから削除 (安全な方法)
export async function DELETE(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { productId } = await req.json();

  if (!productId) {
    return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
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