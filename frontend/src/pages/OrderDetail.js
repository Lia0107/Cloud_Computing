import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../services/api';
import './OrderDetail.css';

const OrderDetail = () => {
  const { id } = useParams();
  const { data: order, isLoading } = useQuery(
    ['order', id],
    async () => {
      const response = await api.get(`/orders/${id}`);
      return response.data;
    }
  );

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
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return <div className="error">Order not found</div>;
  }

  return (
    <div className="order-detail-page">
      <div className="container">
        <h1>Order Details</h1>

        <div className="order-detail-content">
          <div className="order-info-section">
            <div className="info-card">
              <h2>Order Information</h2>
              <div className="info-row">
                <span>Order ID:</span>
                <span>#{order.id}</span>
              </div>
              <div className="info-row">
                <span>Date:</span>
                <span>{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="info-row">
                <span>Status:</span>
                <span
                  style={{
                    backgroundColor: getStatusColor(order.status),
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    textTransform: 'capitalize',
                  }}
                >
                  {order.status}
                </span>
              </div>
              <div className="info-row">
                <span>Payment Method:</span>
                <span>{order.payment_method}</span>
              </div>
              <div className="info-row">
                <span>Total:</span>
                <span className="total-amount">${parseFloat(order.total_amount).toFixed(2)}</span>
              </div>
            </div>

            <div className="info-card">
              <h2>Shipping Address</h2>
              <p>{order.shipping_address}</p>
            </div>
          </div>

          <div className="order-items-section">
            <h2>Order Items</h2>
            <div className="order-items-list">
              {order.items && order.items.length > 0 ? (
                order.items.map(item => (
                  <div key={item.id} className="order-item">
                    <div className="order-item-info">
                      <h3>{item.product_name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${parseFloat(item.price).toFixed(2)}</p>
                    </div>
                    <div className="order-item-total">
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p>No items found</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;

