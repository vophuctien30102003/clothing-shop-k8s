import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{
          backgroundColor: '#fff',
          padding: '1rem 2rem',
          borderBottom: '1px solid #ddd',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h1 style={{ margin: 0 }}>Quản trị</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span>{user?.email}</span>
            <Link to="/home" style={{ color: '#007bff', textDecoration: 'none' }}>Về trang chủ</Link>
            <button onClick={logout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
          </div>
        </header>
        <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f5f5f5' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

