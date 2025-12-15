import { useState, useEffect } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import AdminLayout from '../../components/admin/AdminLayout';
import { reportService } from '../../services/reportService';
import Loading from '../../components/common/Loading';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
    loadChartData();
  }, []);

  const loadDashboard = async () => {
    try {
      const res = await reportService.getDashboard();
      setDashboard(res.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChartData = async () => {
    try {
      const res = await reportService.getChartData('revenue', '7d');
      const data = res.data.data || [];
      
      setChartData({
        labels: data.map((d) => d.period),
        datasets: [
          {
            label: 'Doanh thu',
            data: data.map((d) => d.revenue),
            borderColor: 'rgb(75, 192, 192)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to load chart data:', error);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading || !dashboard) {
    return (
      <AdminLayout>
        <Loading />
      </AdminLayout>
    );
  }

  const kpi = dashboard.kpi || {};

  return (
    <AdminLayout>
      <h1>Dashboard</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tổng doanh thu</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(kpi.totalRevenue || 0)}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tổng đơn hàng</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{kpi.totalOrders || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Đơn hoàn thành</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{kpi.completedOrders || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tổng sản phẩm</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{kpi.totalProducts || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Hết hàng</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{kpi.outOfStockProducts || 0}</p>
        </div>
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Khách hàng</h3>
          <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{kpi.totalCustomers || 0}</p>
        </div>
      </div>

      {chartData && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2>Doanh thu 7 ngày gần nhất</h2>
          <Line data={chartData} />
        </div>
      )}

      {dashboard.topProducts && dashboard.topProducts.length > 0 && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>Top 5 sản phẩm bán chạy</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #ddd' }}>
                <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sản phẩm</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Đã bán</th>
                <th style={{ padding: '0.5rem', textAlign: 'right' }}>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.topProducts.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '0.5rem' }}>{item.product?.name || 'N/A'}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.totalSold || 0}</td>
                  <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatPrice(item.totalRevenue || 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

