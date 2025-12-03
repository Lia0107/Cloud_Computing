import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import './Home.css';

const Home = () => {
  const { data: products, isLoading } = useQuery('featured-products', async () => {
    const response = await api.get('/products?limit=6');
    return response.data.products;
  });

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Welcome to Our E-Commerce Store</h1>
          <p>Discover amazing products at great prices</p>
          <Link to="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      </section>

      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          {isLoading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products?.slice(0, 6).map(product => (
                <Link key={product.id} to={`/products/${product.id}`} className="product-card">
                  <div className="product-image">
                    <img 
                      src={product.image_url || 'https://via.placeholder.com/300x300?text=Product'} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/300x300?text=Product';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/products" className="btn btn-secondary">View All Products</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

