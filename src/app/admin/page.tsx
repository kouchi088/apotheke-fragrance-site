'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// --- Reusable Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full pt-20">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

// --- Login Component ---

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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
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


// --- Admin Section Components ---

const Sidebar = ({ activeView, setActiveView }: { activeView: string, setActiveView: (view: string) => void }) => {
  const navItems = [
    { id: 'dashboard', name: 'ダッシュボード' },
    { id: 'orders', name: '注文履歴' },
    { id: 'affiliates', name: 'アフィリエイト管理' },
    { id: 'ugc', name: 'UGC審査' },
  ];

  return (
    <aside className="w-64 bg-gray-200/50 p-4 border-r border-gray-300">
      <h2 className="text-lg font-semibold mb-4">管理メニュー</h2>
      <nav>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  activeView === item.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const DashboardView = () => {
  const [stats, setStats] = useState({ clicks: 0, conversions: 0, totalCommission: 0 });
  const [recentConversions, setRecentConversions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clicksRes, conversionsRes, recentRes] = await Promise.all([
          supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }),
          supabase.from('order_affiliates').select('commission_amount'),
          supabase.from('order_affiliates').select('*, affiliates(name)').order('created_at', { ascending: false }).limit(10)
        ]);

        if (clicksRes.error) throw clicksRes.error;
        if (conversionsRes.error) throw conversionsRes.error;
        if (recentRes.error) throw recentRes.error;

        const totalCommission = conversionsRes.data.reduce((sum, item) => sum + item.commission_amount, 0);

        setStats({
          clicks: clicksRes.count ?? 0,
          conversions: conversionsRes.data.length,
          totalCommission: totalCommission,
        });
        setRecentConversions(recentRes.data);

      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
        setError(`Failed to load dashboard: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;

  const StatCard = ({ title, value, extra = '' }: { title: string, value: string | number, extra?: string }) => (
    <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
      <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</h4>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value} <span className="text-lg font-medium">{extra}</span></p>
    </div>
  );

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">ダッシュボード</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="合計クリック数" value={stats.clicks.toLocaleString()} extra="回" />
        <StatCard title="コンバージョン数" value={stats.conversions.toLocaleString()} extra="件" />
        <StatCard title="合計報酬額" value={`¥${Math.round(stats.totalCommission).toLocaleString()}`} />
      </div>

      <h4 className="text-xl font-semibold mb-4">最近のコンバージョン</h4>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">日時</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">アフィリエイター</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">報酬額</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">支払い状況</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {recentConversions.length > 0 ? (
              recentConversions.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">{new Date(item.created_at).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-gray-900">{item.affiliates?.name || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">¥{Math.round(item.commission_amount).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">まだコンバージョンはありません。</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const OrderHistoryView = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

    fetchOrders();
  }, []);

  const handleShippingToggle = async (orderId: string, currentStatus: boolean) => {
    const originalOrders = [...orders];
    const newStatus = !currentStatus;
    setOrders(orders.map(o => o.id === orderId ? { ...o, shipped: newStatus } : o));
    const { error } = await supabase.from('orders').update({ shipped: newStatus }).eq('id', orderId);
    if (error) {
      console.error('Error updating shipping status:', error);
      setOrders(originalOrders);
      alert(`Failed to update shipping status: ${error.message}`);
    }
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    return `${address.postal_code || ''} ${address.state || ''} ${address.city || ''} ${address.line1 || ''} ${address.line2 || ''}`.trim();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-4">注文履歴</h3>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">日付</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">注文者</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">連絡先</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">住所</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">値段</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">配送状況</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">{order.shipping_address?.name || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">{order.customer_email || 'N/A'}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-500">{formatAddress(order.shipping_address?.address)}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">¥{(order.total || 0).toLocaleString()}</td>
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
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AffiliateView = () => {
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRateType, setNewRateType] = useState<'percentage' | 'fixed'>('percentage');
  const [newRateValue, setNewRateValue] = useState('10'); // Default to 10%
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);


  const fetchAffiliateStats = async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.rpc('get_affiliate_stats');

    if (error) {
      console.error('Error fetching affiliate stats:', error);
      setError(`Failed to fetch affiliate stats: ${error.message}`);
    } else {
      setAffiliates(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAffiliateStats();
  }, []);

  const handleAddAffiliate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setFormLoading(true);

    const rateValueNumber = parseFloat(newRateValue);
    if (isNaN(rateValueNumber)) {
        setFormError('Rate value must be a number.');
        setFormLoading(false);
        return;
    }
    
    const finalRateValue = newRateType === 'percentage' ? rateValueNumber / 100 : rateValueNumber;

    const { error } = await supabase.from('affiliates').insert({
        name: newName,
        email: newEmail,
        default_rate_type: newRateType,
        default_rate_value: finalRateValue,
    });

    if (error) {
        setFormError(`Failed to add affiliate: ${error.message}`);
    } else {
        setNewName('');
        setNewEmail('');
        setNewRateType('percentage');
        setNewRateValue('10');
        await fetchAffiliateStats(); // Refetch stats after adding
    }
    setFormLoading(false);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">アフィリエイト管理</h3>
      
      {/* Add New Affiliate Form */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
        <h4 className="text-xl font-semibold mb-4">新規紹介者登録</h4>
        <form onSubmit={handleAddAffiliate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">名前</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div className="flex gap-2">
            <div>
                <label className="block text-sm font-medium text-gray-700">報酬タイプ</label>
                <select value={newRateType} onChange={e => setNewRateType(e.target.value as any)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500">
                    <option value="percentage">割合 (%)</option>
                    <option value="fixed">固定額 (¥)</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">報酬</label>
                <input type="number" value={newRateValue} onChange={e => setNewRateValue(e.target.value)} required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={formLoading} className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400">
              {formLoading ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
        {formError && <p className="text-sm text-red-600 mt-2">{formError}</p>}
      </div>

      {/* Affiliate List */}
      <h4 className="text-xl font-semibold mb-4">紹介者一覧</h4>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">名前</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">クリック</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">CV</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">報酬額</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
              <th className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {affiliates.length > 0 ? (
              affiliates.map((aff) => (
                <tr key={aff.id}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{aff.name}</div>
                    <div className="text-gray-500">{aff.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">{aff.total_clicks}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">{aff.total_conversions}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-gray-900">¥{Math.round(aff.total_commission).toLocaleString()}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ aff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {aff.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/admin/affiliates/${aff.id}`} className="text-blue-600 hover:text-blue-900">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500">No affiliates found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const UgcModerationView = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('ugc_submissions')
        .select(`
          *,
          product:products (name),
          images:ugc_images (*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSubmissions(data);
    } catch (err: any) {
      console.error("Error fetching pending UGC submissions:", err);
      setError(`Failed to load submissions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSubmissions();
  }, []);

  const handleDecision = async (submissionId: string, newStatus: 'approved' | 'rejected') => {
    // Optimistically update UI
    setSubmissions(submissions.filter(s => s.id !== submissionId));

    const { error } = await supabase
      .from('ugc_submissions')
      .update({ status: newStatus, decided_at: new Date().toISOString() })
      .eq('id', submissionId);

    if (error) {
      console.error(`Error updating submission status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus} submission. It may have been processed already. Refreshing the list.`);
      // Re-fetch to get the correct state
      fetchPendingSubmissions();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 bg-red-100 p-4 rounded-md">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-bold mb-6">UGC審査</h3>
      {submissions.length > 0 ? (
        <div className="space-y-6">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-gray-50 rounded-lg shadow-md overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{submission.product?.name || '商品不明'}</p>
                    <p className="text-sm text-gray-500">
                      投稿者: {submission.nickname || '匿名'} ({submission.email})
                    </p>
                    <p className="text-sm text-gray-500">
                      投稿日: {new Date(submission.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleDecision(submission.id, 'approved')}
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      承認
                    </button>
                    <button
                      onClick={() => handleDecision(submission.id, 'rejected')}
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      却下
                    </button>
                  </div>
                </div>
                {submission.caption && (
                  <p className="mt-4 text-gray-700 bg-white p-3 rounded-md">{submission.caption}</p>
                )}
              </div>
              {submission.images && submission.images.length > 0 && (
                <div className="p-5">
                  <p className="text-sm font-medium text-gray-600 mb-3">投稿画像:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {submission.images.map((image: any) => (
                      <a key={image.id} href={image.cdn_url} target="_blank" rel="noopener noreferrer">
                        <img 
                          src={image.cdn_url} 
                          alt="User submitted content" 
                          className="rounded-md object-cover h-32 w-full shadow-sm hover:shadow-lg transition-shadow"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">審査待ちの投稿はありません。</p>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'orders':
        return <OrderHistoryView />;
      case 'affiliates':
        return <AffiliateView />;
      case 'ugc':
        return <UgcModerationView />;
      default:
        return <p>Select a view from the sidebar.</p>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-grow p-6 sm:p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Admin</h1>
          <button onClick={handleLogout} className="px-4 py-2 font-semibold text-white bg-red-600 rounded-md hover:bg-red-700">
            Logout
          </button>
        </div>
        <p className="mb-8 text-gray-600">Welcome, {user?.email}!</p>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};


// --- Main Admin Page Component ---

const AdminPage = () => {
  const { user } = useAuth();
  const [view, setView] = useState<'LOADING' | 'LOGIN_FORM' | 'DASHBOARD'>('LOADING');

  useEffect(() => {
    if (user) {
      if (user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        setView('DASHBOARD');
      } else {
        supabase.auth.signOut();
        setView('LOGIN_FORM');
      }
    } else {
      setView('LOGIN_FORM');
    }
  }, [user]);

  const handleLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message);
    }
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
