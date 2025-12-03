import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('orders');

  const { data: orders } = useQuery('admin-orders', async () => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  });

  const { data: products } = useQuery('admin-products', async () => {
    const response = await api.get('/products');
    return response.data.products;
  });

  const updateOrderStatusMutation = useMutation(
    async ({ orderId, status }) => {
      const response = await api.put(`/orders/${orderId}/status`, { status });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('admin-orders');
      },
    }
  );

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Products
          </button>
        </div>

        {activeTab === 'orders' && (
          <div className="admin-section">
            <h2>All Orders</h2>
            {orders && orders.length > 0 ? (
              <div className="admin-orders-list">
                {orders.map(order => (
                  <div key={order.id} className="admin-order-card">
                    <div className="order-header">
                      <div>
                        <h3>Order #{order.id}</h3>
                        <p>Customer: {order.user_email || 'Guest'}</p>
                        <p>Date: {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="order-actions">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{
                            padding: '0.5rem',
                            borderRadius: '5px',
                            border: '1px solid #d1d5db',
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    <div className="order-items">
                      {order.items && order.items.length > 0 && (
                        <p>{order.items.length} item(s)</p>
                      )}
                    </div>
                    <div className="order-total">
                      <strong>Total: ${parseFloat(order.total_amount).toFixed(2)}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No orders found</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="admin-section">
            <h2>All Products</h2>
            {products && products.length > 0 ? (
              <div className="admin-products-list">
                {products.map(product => (
                  <div key={product.id} className="admin-product-card">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/100x100?text=Product'}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/100x100?text=Product';
                      }}
                    />
                    <div className="product-details">
                      <h3>{product.name}</h3>
                      <p>Category: {product.category}</p>
                      <p>Price: ${parseFloat(product.price).toFixed(2)}</p>
                      <p>Stock: {product.stock_quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No products found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

