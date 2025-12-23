import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('analytics');
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');

  const { data: orders } = useQuery('admin-orders', async () => {
    const response = await api.get('/orders/admin/all');
    return response.data;
  });

  const { data: me } = useQuery('admin-me', async () => {
    const response = await api.get('/auth/me');
    return response.data.user;
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

  const changePasswordMutation = useMutation(
    async () => {
      const response = await api.post('/auth/change-password', passwordForm);
      return response.data;
    },
    {
      onSuccess: (data) => {
        setPasswordMsg(data.message || 'Password updated');
        setPasswordErr('');
        setPasswordForm({ oldPassword: '', newPassword: '' });
      },
      onError: (error) => {
        setPasswordMsg('');
        setPasswordErr(error.response?.data?.message || 'Failed to update password');
      },
    }
  );

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatusMutation.mutate({ orderId, status: newStatus });
  };

  const analytics = useMemo(() => {
    const totalOrders = orders?.length || 0;
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount || 0), 0) || 0;
    const pending = orders?.filter(o => o.status === 'pending').length || 0;
    const delivered = orders?.filter(o => o.status === 'delivered').length || 0;
    return { totalOrders, totalRevenue, pending, delivered };
  }, [orders]);

  return (
    <div className="admin-dashboard">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-tabs">
          <button
            className={activeTab === 'analytics' ? 'active' : ''}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
          <button
            className={activeTab === 'orders' ? 'active' : ''}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </button>
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        {activeTab === 'analytics' && (
          <div className="admin-section">
            <h2>Overview</h2>
            <div className="admin-metrics">
              <div className="metric-card">
                <p>Total Orders</p>
                <h3>{analytics.totalOrders}</h3>
              </div>
              <div className="metric-card">
                <p>Total Revenue</p>
                <h3>${analytics.totalRevenue.toFixed(2)}</h3>
              </div>
              <div className="metric-card">
                <p>Pending</p>
                <h3>{analytics.pending}</h3>
              </div>
              <div className="metric-card">
                <p>Delivered</p>
                <h3>{analytics.delivered}</h3>
              </div>
            </div>
          </div>
        )}

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
                        <p>Customer: {order.user_deleted ? 'Deleted User' : (order.user_email || 'Guest')}</p>
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

        {activeTab === 'profile' && (
          <div className="admin-section">
            <h2>Profile</h2>
            {me && (
              <div className="profile-card">
                <p><strong>Email:</strong> {me.email}</p>
                <p><strong>Name:</strong> {me.first_name} {me.last_name}</p>
                <p><strong>Role:</strong> {me.role}</p>
                <p><strong>Joined:</strong> {new Date(me.created_at).toLocaleString()}</p>
              </div>
            )}
            <h3 style={{ marginTop: '1.5rem' }}>Change Password</h3>
            {passwordMsg && <div className="success">{passwordMsg}</div>}
            {passwordErr && <div className="error">{passwordErr}</div>}
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                value={passwordForm.oldPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="input"
                minLength={6}
              />
            </div>
            <button
              className="btn btn-primary"
              onClick={() => changePasswordMutation.mutate()}
              disabled={changePasswordMutation.isLoading}
            >
              {changePasswordMutation.isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

