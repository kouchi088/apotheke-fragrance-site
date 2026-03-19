'use server';

import { revalidatePath } from 'next/cache';
import { getSupabaseAdminClient } from '@/lib/adminAuth';
import { getTableColumns, pickExistingColumns } from '@/lib/admin/db';
import { ORDER_STATUS_OPTIONS } from '@/lib/orders';

export async function updateOrderStatus(formData: FormData) {
  const orderId = String(formData.get('orderId') || '').trim();
  const status = String(formData.get('status') || '').trim();

  if (!orderId || !ORDER_STATUS_OPTIONS.includes(status as (typeof ORDER_STATUS_OPTIONS)[number])) {
    return;
  }

  const db = getSupabaseAdminClient();
  const columns = await getTableColumns('orders');
  await db
    .from('orders')
    .update(
      pickExistingColumns(
        {
          status,
          updated_at: new Date().toISOString(),
        },
        columns,
      ),
    )
    .eq('id', orderId);

  revalidatePath('/admin');
  revalidatePath('/admin/orders');
}
