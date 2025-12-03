import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import './Orders.css';

const Orders = () => {
  const { data: orders, isLoading } = useQuery('my-orders', async () => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  });

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

  if (isLoading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>

        {!orders || orders.length === 0 ? (
          <div className="empty-orders">
            <p>You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
                <div className="order-header">
                  <div>
                    <h3>Order #{order.id}</h3>
                    <p className="order-date">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="order-status">
                    <span
                      style={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        fontSize: '0.875rem',
                        textTransform: 'capitalize',
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="order-items-preview">
                  {order.items && order.items.length > 0 && (
                    <p>
                      {order.items.length} item{order.items.length > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
                <div className="order-total">
                  <strong>Total: ${parseFloat(order.total_amount).toFixed(2)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

