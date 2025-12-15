import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function Cart() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (isAuthenticated()) {
      loadCart();
    } else {
      navigate('/login');
    }
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(savedCart);
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(productId);
      return;
    }
    const updatedCart = cart.map((item) =>
      item.product_id === productId ? { ...item, quantity: newQuantity } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const removeItem = (productId) => {
    const updatedCart = cart.filter((item) => item.product_id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ProtectedRoute requireUser={true}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <h1>Giỏ hàng</h1>

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Giỏ hàng trống</p>
              <Link to="/home" style={{ color: '#007bff', textDecoration: 'none' }}>
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: '2rem' }}>
                {cart.map((item) => (
                  <div
                    key={item.product_id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      padding: '1rem',
                      border: '1px solid #ddd',
                      marginBottom: '1rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h3>{item.name}</h3>
                      <p>{formatPrice(item.price)}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <label>
                        Số lượng:
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value) || 1)}
                          style={{ marginLeft: '0.5rem', padding: '4px', width: '60px' }}
                        />
                      </label>
                      <div style={{ minWidth: '120px', textAlign: 'right' }}>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </div>
                      <button
                        onClick={() => removeItem(item.product_id)}
                        style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '1.5rem',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                textAlign: 'right',
                marginBottom: '2rem',
              }}>
                <h2>Tổng tiền: {formatPrice(total)}</h2>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link to="/home" style={{ marginRight: '1rem', color: '#007bff', textDecoration: 'none' }}>
                  Tiếp tục mua sắm
                </Link>
                <Link
                  to="/home/checkout"
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#28a745',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  Thanh toán
                </Link>
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </ProtectedRoute>
  );
}

