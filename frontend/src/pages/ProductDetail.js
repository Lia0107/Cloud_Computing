import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');

  const { data: product, isLoading } = useQuery(
    ['product', id],
    async () => {
      const response = await api.get(`/products/${id}`);
      return response.data;
    }
  );

  const addToCartMutation = useMutation(
    async (data) => {
      const response = await api.post('/cart/add', data);
      return response.data;
    },
    {
      onSuccess: () => {
        setMessage('Product added to cart!');
        queryClient.invalidateQueries('cart');
        setTimeout(() => setMessage(''), 3000);
      },
      onError: (error) => {
        setMessage(error.response?.data?.message || 'Failed to add to cart');
        setTimeout(() => setMessage(''), 3000);
      },
    }
  );

  const handleAddToCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (quantity > product.stock_quantity) {
      setMessage('Insufficient stock');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    addToCartMutation.mutate({
      productId: parseInt(id),
      quantity: parseInt(quantity),
    });
  };

  if (isLoading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return <div className="error">Product not found</div>;
  }

  return (
    <div className="product-detail">
      <div className="container">
        <div className="product-detail-content">
          <div className="product-image-section">
            <img
              src={product.image_url || 'https://via.placeholder.com/500x500?text=Product'}
              alt={product.name}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/500x500?text=Product';
              }}
            />
          </div>

          <div className="product-info-section">
            <h1>{product.name}</h1>
            <p className="product-category">{product.category}</p>
            <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
            <p className="product-description">{product.description}</p>

            <div className="product-stock">
              {product.stock_quantity > 0 ? (
                <span className="in-stock">In Stock ({product.stock_quantity} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            {product.stock_quantity > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label>Quantity:</label>
                  <input
                    type="number"
                    min="1"
                    max={product.stock_quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock_quantity, parseInt(e.target.value) || 1)))}
                    className="input"
                    style={{ width: '100px' }}
                  />
                </div>
                <button
                  onClick={handleAddToCart}
                  className="btn btn-primary"
                  disabled={addToCartMutation.isLoading}
                >
                  {addToCartMutation.isLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            )}

            {message && (
              <div className={message.includes('success') || message.includes('added') ? 'success' : 'error'}>
                {message}
              </div>
            )}

            <div className="product-details">
              <h3>Product Details</h3>
              <ul>
                <li><strong>SKU:</strong> {product.sku}</li>
                <li><strong>Category:</strong> {product.category}</li>
                <li><strong>Price:</strong> ${parseFloat(product.price).toFixed(2)}</li>
                <li><strong>Stock:</strong> {product.stock_quantity} units</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

