import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getOrders, getProducts } from '../services/api';
import * as XLSX from 'xlsx';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const downloadReport = () => {
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Stats sheet
    const statsData = [
      ['El Yapımı E-Ticaret - Dashboard Raporu'],
      [`Rapor Tarihi: ${new Date().toLocaleDateString('tr-TR')}`],
      [''],
      ['GENEL İSTATİSTİKLER'],
      ['Metrik', 'Değer'],
      ['Toplam Ürün', stats.totalProducts],
      ['Toplam Sipariş', stats.totalOrders],
      ['Toplam Gelir (TL)', stats.totalRevenue],
      ['Toplam Kullanıcı', stats.totalUsers],
    ];
    const statsSheet = XLSX.utils.aoa_to_sheet(statsData);
    XLSX.utils.book_append_sheet(wb, statsSheet, 'İstatistikler');
    
    // Orders sheet
    const ordersData = [
      ['SON SİPARİŞLER'],
      ['Sipariş No', 'Müşteri', 'Tutar (TL)', 'Durum'],
      ...recentOrders.map(order => [order.orderNumber, order.customer, order.total, order.status])
    ];
    const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData);
    XLSX.utils.book_append_sheet(wb, ordersSheet, 'Siparişler');
    
    // Top Products sheet
    const productsData = [
      ['EN ÇOK SATAN ÜRÜNLER'],
      ['Ürün Adı', 'Satış Adedi', 'Gelir (TL)'],
      ...topProducts.map(product => [product.name, product.sales, product.revenue])
    ];
    const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
    XLSX.utils.book_append_sheet(wb, productsSheet, 'En Çok Satanlar');
    
    // Download
    XLSX.writeFile(wb, `rapor_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const fetchDashboardData = async () => {
    try {
      const res = await getDashboardStats();
      const data = res.data;
      
      setStats({
        totalProducts: data.stats.totalProducts || 0,
        totalOrders: data.stats.totalOrders || 0,
        totalRevenue: data.stats.totalRevenue || 0,
        totalUsers: data.stats.totalUsers || 0,
      });

      setRecentOrders(data.recentOrders || []);
      setTopProducts(data.topProducts || []);

      setLoading(false);
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      // Fallback to mock data
      setStats({
        totalProducts: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
      });
      setRecentOrders([]);
      setTopProducts([]);
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Toplam Ürün',
      value: stats.totalProducts,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      color: 'from-primary-400 to-primary-500',
      bgColor: 'bg-primary-50',
      textColor: 'text-primary-500',
    },
    {
      title: 'Toplam Sipariş',
      value: stats.totalOrders,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: 'from-accent-400 to-accent-500',
      bgColor: 'bg-accent-50',
      textColor: 'text-accent-500',
    },
    {
      title: 'Toplam Gelir',
      value: `₺${stats.totalRevenue.toLocaleString('tr-TR')}`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-green-400 to-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-500',
    },
    {
      title: 'Toplam Kullanıcı',
      value: stats.totalUsers,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-purple-400 to-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-500',
    },
  ];

  // Chart data
  const salesData = [
    { name: 'Ocak', sales: 1200 },
    { name: 'Şubat', sales: 1800 },
    { name: 'Mart', sales: 1400 },
    { name: 'Nisan', sales: 2200 },
    { name: 'Mayıs', sales: 1900 },
    { name: 'Haziran', sales: 2800 },
  ];

  const categoryData = [
    { name: 'Kavanozlar', value: 35, color: '#f48a9a' },
    { name: 'Çerçeveler', value: 25, color: '#38bdf8' },
    { name: 'Mumlar', value: 20, color: '#4ade80' },
    { name: 'Dekorasyon', value: 20, color: '#a78bfa' },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Beklemede', class: 'badge-warning' },
      processing: { label: 'Hazırlanıyor', class: 'badge-info' },
      shipped: { label: 'Kargoda', class: 'badge-primary' },
      delivered: { label: 'Teslim Edildi', class: 'badge-success' },
      cancelled: { label: 'İptal', class: 'badge-danger' },
    };
    const { label, class: className } = statusMap[status] || { label: status, class: 'badge-info' };
    return <span className={`badge ${className}`}>{label}</span>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Mağazanızın genel durumunu görüntüleyin</p>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadReport} className="btn-outline flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Rapor İndir
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
              </div>
              <div className={`w-14 h-14 rounded-xl ${card.bgColor} flex items-center justify-center ${card.textColor}`}>
                {card.icon}
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                12%
              </span>
              <span className="text-gray-400 text-sm">geçen aya göre</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Aylık Satışlar</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f48a9a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f48a9a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Satış']}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#f48a9a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorSales)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Kategori Dağılımı</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`%${value}`, 'Oran']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">Son Siparişler</h3>
            <Link to="/orders" className="text-sm text-primary-500 hover:text-primary-600">
              Tümünü Gör →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="table-header">
                <tr>
                  <th className="text-left px-6 py-3">Sipariş</th>
                  <th className="text-left px-6 py-3">Müşteri</th>
                  <th className="text-left px-6 py-3">Tutar</th>
                  <th className="text-left px-6 py-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="table-row">
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      ₺{order.total.toLocaleString('tr-TR')}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(order.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="card overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">En Çok Satan Ürünler</h3>
            <Link to="/products" className="text-sm text-primary-500 hover:text-primary-600">
              Tümünü Gör →
            </Link>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-100 to-accent-100 rounded-lg flex items-center justify-center text-primary-500 font-bold">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sales} satış</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-800">₺{product.revenue.toLocaleString('tr-TR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;