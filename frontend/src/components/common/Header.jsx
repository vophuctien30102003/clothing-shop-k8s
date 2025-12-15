import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout, getRedirectPath } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/home');
  };

  return (
    <header style={{
      backgroundColor: '#333',
      color: '#fff',
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <Link to="/home" style={{ color: '#fff', textDecoration: 'none', fontSize: '1.5rem', fontWeight: 'bold' }}>
        Clothing Shop
      </Link>
      <nav style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {isAuthenticated() ? (
          <>
            {user?.role === 'admin' || user?.role === 'manager' ? (
              <Link to="/admin/dashboard" style={{ color: '#fff', textDecoration: 'none' }}>Admin</Link>
            ) : null}
            <Link to="/home/cart" style={{ color: '#fff', textDecoration: 'none' }}>Cart</Link>
            <Link to="/profile" style={{ color: '#fff', textDecoration: 'none' }}>Profile</Link>
            <span>{user?.email}</span>
            <button onClick={handleLogout} style={{ padding: '8px 16px', cursor: 'pointer' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: '#fff', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </nav>
    </header>
  );
}

