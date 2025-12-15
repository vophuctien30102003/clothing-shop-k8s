import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const NUMERIC_FILTER_KEYS = ['page', 'limit', 'category_id', 'min_price', 'max_price'];
  const [filters, setFilters] = useState({
    page: 1,
    limit: 12,
    search: '',
    category_id: '',
    min_price: '',
    max_price: '',
    sort_by: 'created_at',
    sort_order: 'DESC',
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const sanitizeFilters = (inputFilters) => {
    return Object.entries(inputFilters).reduce((acc, [key, value]) => {
      if (value === '' || value === null || value === undefined) {
        return acc;
      }

      if (NUMERIC_FILTER_KEYS.includes(key)) {
        const numericValue = Number(value);
        if (!Number.isNaN(numericValue)) {
          acc[key] = numericValue;
        }
        return acc;
      }

      acc[key] = value;
      return acc;
    }, {});
  };

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
      const query = sanitizeFilters(filters);
      const res = await productService.list(query);
      setProducts(res.data.products || []);
      setPagination(res.data.pagination || {});
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value, page: 1 });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <main style={{ flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h1>Danh sách sản phẩm</h1>

        <div style={{ display: 'flex', gap: '2rem', marginBottom: '2rem' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: '100%', padding: '8px', marginBottom: '1rem' }}
            />
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <select
                value={filters.category_id}
                onChange={(e) => handleFilterChange('category_id', e.target.value)}
                style={{ padding: '8px' }}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={`${filters.sort_by}_${filters.sort_order}`}
                onChange={(e) => {
                  const [sort_by, sort_order] = e.target.value.split('_');
                  setFilters({ ...filters, sort_by, sort_order, page: 1 });
                }}
                style={{ padding: '8px' }}
              >
                <option value="created_at_DESC">Mới nhất</option>
                <option value="price_ASC">Giá tăng dần</option>
                <option value="price_DESC">Giá giảm dần</option>
                <option value="name_ASC">Tên A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem',
            }}>
              {products.map((product) => (
                <Link
                  key={product.id}
                  to={`/home/products/${product.id}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    padding: '1rem',
                    transition: 'transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    <div style={{ height: '200px', backgroundColor: '#f5f5f5', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span>No Image</span>
                    </div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{product.name}</h3>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      {product.sale_price ? (
                        <>
                          <span style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                            {formatPrice(product.sale_price)}
                          </span>
                          <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span style={{ fontWeight: 'bold' }}>{formatPrice(product.price)}</span>
                      )}
                    </div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666' }}>
                      Stock: {product.stock}
                    </div>
                  </div>
                </Link>
              ))}
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
      </main>
      <Footer />
    </div>
  );
}

