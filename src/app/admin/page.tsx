'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabaseClient';

const supabase = createClient();

// --- Reusable Components ---

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-full pt-20">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
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
    <div className="flex justify-center items-center min-h-screen bg-background text-foreground font-sans">
      <div className="w-full max-w-md p-10 bg-white border border-accent shadow-sm rounded-sm">
        <h1 className="text-3xl font-serif font-bold text-center mb-8">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div>
            <button type="submit" disabled={loading} className="w-full py-3 px-6 bg-foreground text-white text-xs uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50">
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
    <aside className="w-64 bg-white border-r border-accent p-6 hidden md:block">
      <h2 className="text-xs font-bold tracking-widest uppercase mb-8 text-primary">Admin Menu</h2>
      <nav>
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors duration-200 border-l-2 ${
                  activeView === item.id
                    ? 'border-foreground text-foreground font-bold bg-accent/30'
                    : 'border-transparent text-secondary hover:text-foreground hover:bg-accent/10'
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
  if (error) return <p className="text-red-500 bg-red-50 p-4 border border-red-100">{error}</p>;

  const StatCard = ({ title, value, extra = '' }: { title: string, value: string | number, extra?: string }) => (
    <div className="bg-white p-6 border border-accent shadow-sm">
      <h4 className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">{title}</h4>
      <p className="text-3xl font-serif text-foreground">{value} <span className="text-base font-sans text-primary">{extra}</span></p>
    </div>
  );

  return (
    <div className="space-y-8">
      <h3 className="text-2xl font-serif text-foreground">ダッシュボード</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="合計クリック数" value={stats.clicks.toLocaleString()} extra="回" />
        <StatCard title="コンバージョン数" value={stats.conversions.toLocaleString()} extra="件" />
        <StatCard title="合計報酬額" value={`¥${Math.round(stats.totalCommission).toLocaleString()}`} />
      </div>

      <div>
        <h4 className="text-lg font-serif mb-4 text-foreground">最近のコンバージョン</h4>
        <div className="overflow-x-auto bg-white border border-accent">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-accent/30 border-b border-accent text-primary">
                <th className="px-6 py-3 font-medium">日時</th>
                <th className="px-6 py-3 font-medium">アフィリエイター</th>
                <th className="px-6 py-3 font-medium">報酬額</th>
                <th className="px-6 py-3 font-medium">支払い状況</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-accent">
              {recentConversions.length > 0 ? (
                recentConversions.map((item) => (
                  <tr key={item.id} className="hover:bg-accent/10 transition-colors">
                    <td className="px-6 py-4 text-foreground">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{item.affiliates?.name || 'N/A'}</td>
                    <td className="px-6 py-4 text-foreground">¥{Math.round(item.commission_amount).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${ item.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-secondary">まだコンバージョンはありません。</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
  if (error) return <p className="text-red-500 bg-red-50 p-4 border border-red-100">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6 text-foreground">注文履歴</h3>
      <div className="overflow-x-auto bg-white border border-accent">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-accent/30 border-b border-accent text-primary">
              <th className="px-6 py-3 font-medium">日付</th>
              <th className="px-6 py-3 font-medium">注文者</th>
              <th className="px-6 py-3 font-medium">連絡先</th>
              <th className="px-6 py-3 font-medium">住所</th>
              <th className="px-6 py-3 font-medium">値段</th>
              <th className="px-6 py-3 font-medium">配送状況</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent">
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-accent/10 transition-colors">
                  <td className="px-6 py-4 text-foreground">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-foreground">{order.shipping_address?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-secondary">{order.customer_email || 'N/A'}</td>
                  <td className="px-6 py-4 text-secondary max-w-xs truncate">{formatAddress(order.shipping_address?.address)}</td>
                  <td className="px-6 py-4 text-foreground font-medium">¥{(order.total || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={order.shipped || false}
                        onChange={() => handleShippingToggle(order.id, order.shipped || false)}
                        className="h-4 w-4 text-primary border-accent rounded focus:ring-primary"
                      />
                      <span className={`ml-2 text-xs font-bold uppercase ${order.shipped ? 'text-green-600' : 'text-yellow-600'}`}>
                        {order.shipped ? 'Shipped' : 'Pending'}
                      </span>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-secondary">No orders found.</td>
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
  if (error) return <p className="text-red-500 bg-red-50 p-4 border border-red-100">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6 text-foreground">アフィリエイト管理</h3>
      
      {/* Add New Affiliate Form */}
      <div className="bg-white p-8 border border-accent mb-12">
        <h4 className="text-lg font-bold text-foreground mb-6">新規紹介者登録</h4>
        <form onSubmit={handleAddAffiliate} className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
          <div className="md:col-span-1">
            <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">名前</label>
            <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">Email</label>
            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-4 md:col-span-1">
            <div className="flex-1">
                <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">タイプ</label>
                <select value={newRateType} onChange={e => setNewRateType(e.target.value as any)} className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary h-[46px]">
                    <option value="percentage">割合 (%)</option>
                    <option value="fixed">固定額 (¥)</option>
                </select>
            </div>
            <div className="flex-1">
                <label className="block text-xs font-bold tracking-widest text-primary uppercase mb-2">報酬</label>
                <input type="number" value={newRateValue} onChange={e => setNewRateValue(e.target.value)} required className="w-full px-4 py-3 bg-white border border-accent text-foreground text-sm focus:outline-none focus:border-primary" />
            </div>
          </div>
          <div className="md:col-span-1">
            <button type="submit" disabled={formLoading} className="w-full py-3 px-6 bg-foreground text-white text-xs uppercase tracking-widest hover:bg-primary transition-colors disabled:opacity-50 h-[46px]">
              {formLoading ? '登録中...' : '登録'}
            </button>
          </div>
        </form>
        {formError && <p className="text-sm text-red-600 mt-4">{formError}</p>}
      </div>

      {/* Affiliate List */}
      <h4 className="text-lg font-bold text-foreground mb-4">紹介者一覧</h4>
      <div className="overflow-x-auto bg-white border border-accent">
        <table className="min-w-full text-sm text-left">
          <thead>
            <tr className="bg-accent/30 border-b border-accent text-primary">
              <th className="px-6 py-3 font-medium">名前</th>
              <th className="px-6 py-3 font-medium">クリック</th>
              <th className="px-6 py-3 font-medium">CV</th>
              <th className="px-6 py-3 font-medium">報酬額</th>
              <th className="px-6 py-3 font-medium">ステータス</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-accent">
            {affiliates.length > 0 ? (
              affiliates.map((aff) => (
                <tr key={aff.id} className="hover:bg-accent/10 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-foreground">{aff.name}</div>
                    <div className="text-xs text-secondary">{aff.email}</div>
                  </td>
                  <td className="px-6 py-4 text-foreground">{aff.total_clicks}</td>
                  <td className="px-6 py-4 text-foreground">{aff.total_conversions}</td>
                  <td className="px-6 py-4 text-foreground">¥{Math.round(aff.total_commission).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-full ${ aff.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {aff.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Link href={`/admin/affiliates/${aff.id}`} className="text-primary hover:text-foreground underline">
                      詳細
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-secondary">No affiliates found.</td>
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
    setSubmissions(submissions.filter(s => s.id !== submissionId));

    const { error } = await supabase
      .from('ugc_submissions')
      .update({ status: newStatus, decided_at: new Date().toISOString() })
      .eq('id', submissionId);

    if (error) {
      console.error(`Error updating submission status to ${newStatus}:`, error);
      alert(`Failed to ${newStatus} submission. It may have been processed already. Refreshing the list.`);
      fetchPendingSubmissions();
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 bg-red-50 p-4 border border-red-100">{error}</p>;

  return (
    <div>
      <h3 className="text-2xl font-serif mb-6 text-foreground">UGC審査</h3>
      {submissions.length > 0 ? (
        <div className="space-y-8">
          {submissions.map(submission => (
            <div key={submission.id} className="bg-white border border-accent p-6 rounded-sm shadow-sm">
              <div className="flex justify-between items-start mb-4 border-b border-accent pb-4">
                <div>
                  <p className="font-bold text-foreground text-lg">{submission.product?.name || '商品不明'}</p>
                  <p className="text-sm text-primary mt-1">
                    投稿者: {submission.nickname || '匿名'} <span className="text-secondary">({submission.email})</span>
                  </p>
                  <p className="text-xs text-secondary mt-1">
                    投稿日: {new Date(submission.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleDecision(submission.id, 'approved')}
                    className="px-4 py-2 text-xs font-bold text-white bg-green-600 hover:bg-green-700 uppercase tracking-widest transition-colors"
                  >
                    承認
                  </button>
                  <button
                    onClick={() => handleDecision(submission.id, 'rejected')}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 uppercase tracking-widest transition-colors"
                  >
                    却下
                  </button>
                </div>
              </div>
              
              {submission.caption && (
                <div className="mb-6 bg-accent/30 p-4 border-l-4 border-primary">
                  <p className="text-foreground text-sm leading-relaxed">{submission.caption}</p>
                </div>
              )}

              {submission.images && submission.images.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-3">Images</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {submission.images.map((image: any) => (
                      <a key={image.id} href={image.cdn_url} target="_blank" rel="noopener noreferrer" className="block relative aspect-square group overflow-hidden bg-accent">
                        <Image
                          src={image.cdn_url} 
                          alt="User submitted content" 
                          fill
                          style={{ objectFit: 'cover' }}
                          className="transition-transform duration-500 group-hover:scale-105"
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
        <div className="text-center py-24 bg-accent/10 border border-dashed border-accent">
          <p className="text-secondary">現在、審査待ちの投稿はありません。</p>
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
    <div className="flex min-h-screen bg-background font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="flex-grow p-8">
        <div className="flex flex-wrap justify-between items-center gap-4 mb-8 pb-4 border-b border-accent">
          <h1 className="text-2xl font-serif font-bold text-foreground">Admin Console</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-secondary hidden sm:inline">{user?.email}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-xs font-bold text-foreground border border-foreground hover:bg-foreground hover:text-white transition-colors uppercase tracking-widest">
              Logout
            </button>
          </div>
        </div>
        <div className="bg-white p-8 border border-accent shadow-sm min-h-[600px]">
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
      // 簡易的な管理者判定（本番ではRLS等で制御推奨）
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

  return <div className="min-h-screen bg-background">{renderView()}</div>;
};

export default AdminPage;