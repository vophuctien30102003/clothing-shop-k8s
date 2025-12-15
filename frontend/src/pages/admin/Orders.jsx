import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { orderService } from '../../services/orderService';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, status: '' });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadOrders();
  }, [filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await orderService.list(filters);
      setOrders(res.data.orders || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error('Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.update(orderId, { status: newStatus });
      toast.success('Cập nhật trạng thái thành công');
      loadOrders();
      if (selectedOrder?.id === orderId) {
        const res = await orderService.getById(orderId);
        setSelectedOrder(res.data.order);
      }
    } catch (error) {
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  return (
    <AdminLayout>
      <h1>Quản lý đơn hàng</h1>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          style={{ padding: '8px' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedOrder ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div>
          {loading ? (
            <Loading />
          ) : (
            <>
              <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '1rem', textAlign: 'left' }}>Khách hàng</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Tổng tiền</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Trạng thái</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr
                        key={order.id}
                        style={{
                          borderTop: '1px solid #ddd',
                          cursor: 'pointer',
                          backgroundColor: selectedOrder?.id === order.id ? '#f0f0f0' : 'transparent',
                        }}
                        onClick={() => {
                          orderService.getById(order.id).then((res) => setSelectedOrder(res.data.order));
                        }}
                      >
                        <td style={{ padding: '1rem' }}>{order.id}</td>
                        <td style={{ padding: '1rem' }}>{order.user?.email || order.user_id}</td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>{formatPrice(order.total_amount)}</td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            backgroundColor:
                              order.status === 'completed' ? '#d4edda' :
                              order.status === 'cancelled' ? '#f8d7da' :
                              order.status === 'processing' ? '#d1ecf1' : '#fff3cd',
                            color:
                              order.status === 'completed' ? '#155724' :
                              order.status === 'cancelled' ? '#721c24' :
                              order.status === 'processing' ? '#0c5460' : '#856404',
                          }}>
                            {order.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              orderService.getById(order.id).then((res) => setSelectedOrder(res.data.order));
                            }}
                            style={{ padding: '4px 8px', cursor: 'pointer' }}
                          >
                            Xem
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={(page) => setFilters({ ...filters, page })}
                />
              )}
            </>
          )}
        </div>

        {selectedOrder && (
          <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Chi tiết đơn hàng #{selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ padding: '4px 8px' }}>✕</button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <p><strong>Khách hàng:</strong> {selectedOrder.user?.email || selectedOrder.user_id}</p>
              <p><strong>Ngày tạo:</strong> {formatDate(selectedOrder.created_at)}</p>
              <p><strong>Tổng tiền:</strong> {formatPrice(selectedOrder.total_amount)}</p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label><strong>Trạng thái:</strong></label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                style={{ marginLeft: '0.5rem', padding: '8px' }}
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <h3>Sản phẩm:</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '0.5rem', textAlign: 'left' }}>Sản phẩm</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Giá</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Số lượng</th>
                    <th style={{ padding: '0.5rem', textAlign: 'right' }}>Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.orderItems?.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '0.5rem' }}>{item.product?.name || 'N/A'}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatPrice(item.price)}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatPrice(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

