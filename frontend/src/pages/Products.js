import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import './Products.css';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [page, setPage] = useState(parseInt(searchParams.get('page')) || 1);

  const { data, isLoading, error } = useQuery(
    ['products', search, category, page],
    async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category) params.append('category', category);
      params.append('page', page);
      params.append('limit', 12);
      const response = await api.get(`/products?${params.toString()}`);
      return response.data;
    }
  );

  const { data: categories } = useQuery('categories', async () => {
    const response = await api.get('/products/categories/list');
    return response.data;
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    params.append('page', '1');
    setSearchParams(params);
  };

  const handleCategoryChange = (cat) => {
    setCategory(cat);
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (cat) params.append('category', cat);
    params.append('page', '1');
    setSearchParams(params);
  };

  return (
    <div className="products-page">
      <div className="container">
        <h1>Products</h1>

        <div className="products-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
            />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          <div className="category-filters">
            <button
              className={!category ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={() => handleCategoryChange('')}
            >
              All
            </button>
            {categories?.map(cat => (
              <button
                key={cat}
                className={category === cat ? 'btn btn-primary' : 'btn btn-secondary'}
                onClick={() => handleCategoryChange(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div className="error">Error loading products</div>
        ) : (
          <>
            <div className="products-grid">
              {data?.products?.map(product => (
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
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
                    {product.stock_quantity > 0 ? (
                      <span className="in-stock">In Stock</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {data?.pagination && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  disabled={page === 1}
                  onClick={() => {
                    setPage(page - 1);
                    const params = new URLSearchParams(searchParams);
                    params.set('page', page - 1);
                    setSearchParams(params);
                  }}
                >
                  Previous
                </button>
                <span>
                  Page {data.pagination.page} of {data.pagination.totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  disabled={page >= data.pagination.totalPages}
                  onClick={() => {
                    setPage(page + 1);
                    const params = new URLSearchParams(searchParams);
                    params.set('page', page + 1);
                    setSearchParams(params);
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Products;

