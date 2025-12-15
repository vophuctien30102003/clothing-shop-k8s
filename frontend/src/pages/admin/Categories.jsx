import { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { categoryService } from '../../services/categoryService';
import Loading from '../../components/common/Loading';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', status: 'active' });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await categoryService.list({ limit: 100 });
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success('Cập nhật danh mục thành công');
      } else {
        await categoryService.create(formData);
        toast.success('Tạo danh mục thành công');
      }
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ name: '', status: 'active' });
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, status: category.status });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    try {
      await categoryService.delete(id);
      toast.success('Xóa danh mục thành công');
      loadCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Không thể xóa danh mục');
    }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Quản lý danh mục</h1>
        <button
          onClick={() => { setShowForm(true); setEditingCategory(null); setFormData({ name: '', status: 'active' }); }}
          style={{ padding: '8px 16px', backgroundColor: '#28a745', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          + Thêm danh mục
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#fff', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <h2>{editingCategory ? 'Sửa danh mục' : 'Thêm danh mục'}</h2>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label>Tên danh mục *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            <div>
              <label>Trạng thái</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                style={{ padding: '8px', marginTop: '4px' }}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', cursor: 'pointer' }}>
              {editingCategory ? 'Cập nhật' : 'Tạo mới'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setEditingCategory(null); setFormData({ name: '', status: 'active' }); }} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: '#fff', border: 'none', cursor: 'pointer' }}>
              Hủy
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : (
        <div style={{ backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '1rem', textAlign: 'left' }}>ID</th>
                <th style={{ padding: '1rem', textAlign: 'left' }}>Tên</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} style={{ borderTop: '1px solid #ddd' }}>
                  <td style={{ padding: '1rem' }}>{category.id}</td>
                  <td style={{ padding: '1rem' }}>{category.name}</td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', backgroundColor: category.status === 'active' ? '#d4edda' : '#f8d7da', color: category.status === 'active' ? '#155724' : '#721c24' }}>
                      {category.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <button onClick={() => handleEdit(category)} style={{ marginRight: '0.5rem', padding: '4px 8px', cursor: 'pointer' }}>Sửa</button>
                    <button onClick={() => handleDelete(category.id)} style={{ padding: '4px 8px', backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}>Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

