import { Link, useLocation } from 'react-router-dom';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/admin/products', label: 'Sản phẩm', icon: '🛍️' },
    { path: '/admin/categories', label: 'Danh mục', icon: '📁' },
    { path: '/admin/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/admin/reports', label: 'Báo cáo', icon: '📈' },
  ];

  return (
    <aside style={{
      width: '250px',
      backgroundColor: '#2c3e50',
      color: '#fff',
      padding: '1.5rem',
      minHeight: '100vh',
    }}>
      <h2 style={{ marginBottom: '2rem', fontSize: '1.5rem' }}>Admin Panel</h2>
      <nav>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              display: 'block',
              padding: '1rem',
              color: location.pathname === item.path ? '#fff' : '#bdc3c7',
              backgroundColor: location.pathname === item.path ? '#34495e' : 'transparent',
              textDecoration: 'none',
              marginBottom: '0.5rem',
              borderRadius: '4px',
              transition: 'all 0.2s',
            }}
          >
            <span style={{ marginRight: '0.5rem' }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

