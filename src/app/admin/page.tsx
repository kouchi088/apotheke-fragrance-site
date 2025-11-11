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