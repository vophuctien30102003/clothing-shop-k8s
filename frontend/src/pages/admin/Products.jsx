import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [filters, setFilters] = useState({ page: 1, limit: 10, search: '', status: '' });
  const [pagination, setPagination] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    sale_price: '',
    stock: '',
    status: 'active',
    category_id: '',
  });

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const res = await categoryService.list({ limit: 100 });
      setCategories(res.data.categories || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await productService.list(filters);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      toast.error('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock: parseInt(formData.stock) || 0,
        category_id: formData.category_id || null,
      };

      if (editingProduct) {
        await productService.update(editingProduct.id, data);
        toast.success('Cập nhật sản phẩm thành công');
      } else {
        await productService.create(data);
        toast.success('Tạo sản phẩm thành công');
      }
      setShowForm(false);
      setEditingProduct(null);
      resetForm();
      loadProducts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      sale_price: product.sale_price || '',
      stock: product.stock || '',
      status: product.status || 'active',
      category_id: product.category_id || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
      await productService.delete(id);
      toast.success('Xóa sản phẩm thành công');
      loadProducts();
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await productService.export(format, filters);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Export thành công');
    } catch (error) {
      toast.error('Export thất bại');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      sale_price: '',
      stock: '',
      status: 'active',
      category_id: '',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Quản lý sản phẩm</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => handleExport('csv')} style={{ padding: '8px 16px' }}>Export CSV</button>
          <button onClick={() => handleExport('json')} style={{ padding: '8px 16px' }}>Export JSON</button>
          <button onClick={() => { setShowForm(true); resetForm(); setEditingProduct(null); }} style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}>
            + Thêm sản phẩm
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          style={{ padding: '8px', flex: 1 }}
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
          style={{ padding: '8px' }}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2>{editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label>Giá *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label>Giá khuyến mãi</label>
                <input
                  type="number"
                  value={formData.sale_price}
                  onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                  min="0"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label>Tồn kho</label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  min="0"
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                />
              </div>
              <div>
                <label>Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '8px', marginTop: '4px' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label>Mô tả</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="4"
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
                {editingProduct ? 'Cập nhật' : 'Tạo mới'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditingProduct(null); resetForm(); }} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Tên</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Giá</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Tồn kho</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Trạng thái</th>
                  <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} style={{ borderTop: '1px solid #ddd' }}>
                    <td style={{ padding: '1rem' }}>{product.id}</td>
                    <td style={{ padding: '1rem' }}>{product.name}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{formatPrice(product.price)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>{product.stock}</td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: product.status === 'active' ? '#d4edda' : '#f8d7da', color: product.status === 'active' ? '#155724' : '#721c24' }}>
                        {product.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      <button onClick={() => handleEdit(product)} style={{ marginRight: '0.5rem', padding: '4px 8px', cursor: 'pointer' }}>Sửa</button>
                      <button onClick={() => handleDelete(product.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Xóa</button>
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
    </AdminLayout>
  );
}

