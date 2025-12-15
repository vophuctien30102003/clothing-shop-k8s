import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const res = await productService.getById(id);
      setProduct(res.data.product);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      if (window.confirm('Bạn cần đăng nhập để mua hàng. Đi đến trang đăng nhập?')) {
        navigate('/login');
      }
      return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItem = cart.find((item) => item.product_id === product.id);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product_id: product.id,
        name: product.name,
        price: product.sale_price || product.price,
        quantity,
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Đã thêm vào giỏ hàng!');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Loading />
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <main style={{ flex: 1, padding: '2rem', textAlign: 'center' }}>
          <h2>Sản phẩm không tồn tại</h2>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <button onClick={() => navigate('/home')} style={{ marginBottom: '1rem', padding: '8px 16px' }}>
          ← Quay lại
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ height: '400px', backgroundColor: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>No Image</span>
          </div>

          <div>
            <h1>{product.name}</h1>
            <div style={{ margin: '1rem 0' }}>
              {product.sale_price ? (
                <>
                  <span style={{ color: '#e74c3c', fontWeight: 'bold', fontSize: '1.5rem' }}>
                    {formatPrice(product.sale_price)}
                  </span>
                  <span style={{ textDecoration: 'line-through', color: '#999', marginLeft: '1rem' }}>
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            <div style={{ margin: '1rem 0' }}>
              <strong>Mô tả:</strong>
              <p>{product.description || 'Không có mô tả'}</p>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <strong>Tồn kho:</strong> {product.stock}
            </div>

            {product.category && (
              <div style={{ margin: '1rem 0' }}>
                <strong>Danh mục:</strong> {product.category.name}
              </div>
            )}

            <div style={{ margin: '2rem 0', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <label>
                Số lượng:
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  style={{ marginLeft: '0.5rem', padding: '8px', width: '80px' }}
                />
              </label>
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                style={{
                  padding: '12px 24px',
                  backgroundColor: product.stock > 0 ? '#007bff' : '#ccc',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: product.stock > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '1rem',
                }}
              >
                {product.stock > 0 ? 'Thêm vào giỏ' : 'Hết hàng'}
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

