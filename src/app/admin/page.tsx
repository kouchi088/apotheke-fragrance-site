'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// --- Components for different states ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const LoginForm = ({ onLogin }: { onLogin: (email: string, pass: string) => Promise<void> }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-full bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      setError(`Failed to fetch orders: ${error.message}`);
    } else {
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleShippingToggle = async (orderId: string, currentStatus: boolean) => {
    const originalOrders = orders;
    const newStatus = !currentStatus;

    // Optimistically update the UI
    setOrders(originalOrders.map(o => o.id === orderId ? { ...o, shipped: newStatus } : o));

    const { error } = await supabase
      .from('orders')
      .update({ shipped: newStatus })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating shipping status:', error);
      // Revert the UI change on error
      setOrders(originalOrders);
      alert(`Failed to update shipping status: ${error.message}`);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.postal_code || ''} ${address.state || ''} ${address.city || ''} ${address.line1 || ''} ${address.line2 || ''}`.trim();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
          Logout
        </button>
      </div>
      <p className="mb-8">Welcome, {user?.email}!</p>

      <h2 className="text-xl sm:text-2xl font-bold mb-4">Order History</h2>
      {loading && <LoadingSpinner />}
      {error && <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>}
      {!loading && !error && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">日付</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">注文者</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">連絡先</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">住所</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">値段</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">もの (最初の品目)</th>
                <th scope="col" className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">配送状況</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">{order.shipping_details?.name || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">{order.customer_email || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">{formatAddress(order.shipping_details?.address)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-900">¥{order.total_amount?.toLocaleString() || '0'}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-gray-500">{order.line_items?.[0]?.description || 'N/A'}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={order.shipped || false}
                          onChange={() => handleShippingToggle(order.id, order.shipped || false)}
                          className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span className="ml-2 text-gray-700">{order.shipped ? 'Shipped' : 'Pending'}</span>
                      </label>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


// --- Main Admin Page Component ---

const AdminPage = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'LOADING' | 'LOGIN_FORM' | 'DASHBOARD'>('LOADING');

  useEffect(() => {
    if (user) {
      // Check if the logged-in user is the admin
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setView('DASHBOARD');
      } else {
        // Logged in but not an admin, show login form (or an unauthorized message)
        // Forcing a sign out is another option to avoid confusion
        supabase.auth.signOut();
        setView('LOGIN_FORM');
      }
    } else {
      // No user session found
      setView('LOGIN_FORM');
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
    // On successful login, the `onAuthStateChange` in AuthContext will update the `user`,
    // which will trigger the `useEffect` above and change the view.
  };

  const renderView = () => {
    switch (view) {
      case 'LOADING':
        return <LoadingSpinner />;
      case 'LOGIN_FORM':
        return <LoginForm onLogin={handleLogin} />;
      case 'DASHBOARD':
        return <AdminDashboard />;
      default:
        return <LoginForm onLogin={handleLogin} />;
    }
  };

  return <div className="min-h-screen">{renderView()}</div>;
};

export default AdminPage;