import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { reportService } from '../../services/reportService';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

export default function AdminReports() {
  const [reportType, setReportType] = useState('daily');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [week, setWeek] = useState(1);
  const [quarter, setQuarter] = useState(1);

  const loadReport = async () => {
    setLoading(true);
    try {
      let res;
      switch (reportType) {
        case 'daily':
          res = await reportService.getDailyReport(date);
          break;
        case 'weekly':
          res = await reportService.getWeeklyReport(year, week);
          break;
        case 'monthly':
          res = await reportService.getMonthlyReport(year, month);
          break;
        case 'quarterly':
          res = await reportService.getQuarterlyReport(year, quarter);
          break;
        default:
          res = await reportService.getDashboard();
      }
      setReportData(res.data);
    } catch (error) {
      toast.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportType, date, year, month, week, quarter]);

  const handleExport = async (type, format) => {
    try {
      const res = await reportService.exportReport(type, format);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export thành công');
    } catch (error) {
      toast.error('Export thất bại');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <AdminLayout>
      <h1>Báo cáo & Thống kê</h1>

      <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <label>
            Loại báo cáo:
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ marginLeft: '0.5rem', padding: '8px' }}
            >
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
              <option value="quarterly">Theo quý</option>
            </select>
          </label>

          {reportType === 'daily' && (
            <label>
              Ngày:
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{ marginLeft: '0.5rem', padding: '8px' }}
              />
            </label>
          )}

          {reportType === 'weekly' && (
            <>
              <label>
                Năm:
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '100px' }}
                />
              </label>
              <label>
                Tuần:
                <input
                  type="number"
                  min="1"
                  max="52"
                  value={week}
                  onChange={(e) => setWeek(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '80px' }}
                />
              </label>
            </>
          )}

          {reportType === 'monthly' && (
            <>
              <label>
                Năm:
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '100px' }}
                />
              </label>
              <label>
                Tháng:
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '80px' }}
                />
              </label>
            </>
          )}

          {reportType === 'quarterly' && (
            <>
              <label>
                Năm:
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '100px' }}
                />
              </label>
              <label>
                Quý:
                <input
                  type="number"
                  min="1"
                  max="4"
                  value={quarter}
                  onChange={(e) => setQuarter(parseInt(e.target.value))}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '80px' }}
                />
              </label>
            </>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => handleExport('products', 'csv')} style={{ padding: '8px 16px' }}>Export Products CSV</button>
          <button onClick={() => handleExport('orders', 'csv')} style={{ padding: '8px 16px' }}>Export Orders CSV</button>
          <button onClick={() => handleExport('categories', 'csv')} style={{ padding: '8px 16px' }}>Export Categories CSV</button>
        </div>
      </div>

      {loading ? (
        <Loading />
      ) : reportData ? (
        <div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
          }}>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tổng doanh thu</h3>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{formatPrice(reportData.kpi?.totalRevenue || 0)}</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tổng đơn hàng</h3>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.kpi?.totalOrders || 0}</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Đơn hoàn thành</h3>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.kpi?.completedOrders || 0}</p>
            </div>
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <h3 style={{ margin: '0 0 0.5rem 0', color: '#666' }}>Tỷ lệ hoàn thành</h3>
              <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold' }}>{reportData.kpi?.completionRate || 0}%</p>
            </div>
          </div>

          {reportData.topProducts && reportData.topProducts.length > 0 && (
            <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
              <h2>Top sản phẩm bán chạy</h2>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sản phẩm</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Đã bán</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.topProducts.map((item, index) => (
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
        </div>
      ) : null}
    </AdminLayout>
  );
}

