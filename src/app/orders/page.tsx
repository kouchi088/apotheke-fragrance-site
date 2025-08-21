'use client';

import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabaseClient";
import { useAuth } from '@/context/AuthContext'; // ★追加

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  // Add other relevant order fields as per your Supabase table schema
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // ★変更

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("orders")
          .select(
            `
            id,
            created_at,
            total_amount,
            order_details (
              quantity,
              price,
              products (
                name
              )
            )
          `
          )
          .eq("user_id", user.id) // ★ user.uid から user.id に変更
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setOrders(data as Order[]);
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]); // Re-run when user state changes

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading orders...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in to view your orders.</div>;
  }

  if (orders.length === 0) {
    return <div className="flex justify-center items-center min-h-screen">You have no orders yet.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white p-6 rounded-lg shadow-md">
            <p className="text-lg font-semibold">Order ID: {order.id}</p>
            <p className="text-gray-600">Date: {new Date(order.created_at).toLocaleDateString()}</p>
            <p className="text-800">Total: ${order.total_amount.toFixed(2)}</p>
            {/* Add more order details here if available */}
          </div>
        ))}
      </div>
    </div>
  );
}