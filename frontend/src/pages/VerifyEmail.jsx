import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authAPI } from '../services/api';
import './Auth.css';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    if (token) {
      verifyEmail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async () => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyEmail(token, email);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Xác thực thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Xác thực Email</h2>
        
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p>Đang xác thực email...</p>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!token && !loading && !message && (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Vui lòng xác thực tài khoản qua email.
            </p>
            <p style={{ marginBottom: '15px', color: '#666', fontSize: '14px' }}>
              Kiểm tra hộp thư đến (có thể trong thư mục Spam) và click vào link xác thực.
            </p>
            <p className="auth-link">
              <a href="/login">Quay lại đăng nhập</a>
            </p>
          </div>
        )}

        {message && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p className="auth-link">
              <a href="/login">Đăng nhập ngay</a>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

