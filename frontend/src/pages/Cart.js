import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Cart.css';

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: cart, isLoading } = useQuery(
    'cart',
    async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    { enabled: !!user }
  );

  const updateQuantityMutation = useMutation(
    async ({ id, quantity }) => {
      const response = await api.put(`/cart/${id}`, { quantity });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const removeItemMutation = useMutation(
    async (id) => {
      const response = await api.delete(`/cart/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
      },
    }
  );

  const createOrderMutation = useMutation(
    async (orderData) => {
      const response = await api.post('/orders', orderData);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('cart');
        navigate('/orders');
      },
    }
  );

  const handleCheckout = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    createOrderMutation.mutate({
      shippingAddress: formData.get('shippingAddress'),
      paymentMethod: formData.get('paymentMethod'),
    });
  };

  if (!user) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="error">Please login to view your cart</div>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map(item => (
              <div key={item.id} className="cart-item">
                <img
                  src={item.image_url || 'https://via.placeholder.com/150x150?text=Product'}
                  alt={item.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/150x150?text=Product';
                  }}
                />
                <div className="cart-item-info">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">${parseFloat(item.price).toFixed(2)}</p>
                </div>
                <div className="cart-item-quantity">
                  <input
                    type="number"
                    min="1"
                    max={item.stock_quantity}
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = parseInt(e.target.value) || 1;
                      updateQuantityMutation.mutate({ id: item.id, quantity: qty });
                    }}
                    className="input"
                    style={{ width: '80px' }}
                  />
                </div>
                <div className="cart-item-subtotal">
                  ${parseFloat(item.subtotal).toFixed(2)}
                </div>
                <button
                  onClick={() => removeItemMutation.mutate(item.id)}
                  className="btn btn-danger"
                  style={{ padding: '5px 15px' }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${parseFloat(cart.total).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${parseFloat(cart.total).toFixed(2)}</span>
              </div>

              <form onSubmit={handleCheckout} className="checkout-form">
                <div className="form-group">
                  <label>Shipping Address:</label>
                  <textarea
                    name="shippingAddress"
                    required
                    className="input"
                    rows="3"
                    placeholder="Enter your shipping address"
                  />
                </div>
                <div className="form-group">
                  <label>Payment Method:</label>
                  <select name="paymentMethod" required className="input">
                    <option value="">Select payment method</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash_on_delivery">Cash on Delivery</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1rem' }}
                  disabled={createOrderMutation.isLoading}
                >
                  {createOrderMutation.isLoading ? 'Processing...' : 'Checkout'}
                </button>
              </form>

              {createOrderMutation.isError && (
                <div className="error" style={{ marginTop: '1rem' }}>
                  {createOrderMutation.error?.response?.data?.message || 'Failed to create order'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

