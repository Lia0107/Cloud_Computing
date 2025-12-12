import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');

  const { data: profile } = useQuery(
    'profile',
    async () => {
      const response = await api.get('/users/profile');
      return response.data;
    }
  );

  const updateProfileMutation = useMutation(
    async (data) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('profile');
        alert('Profile updated successfully');
      },
    }
  );

  const changePasswordMutation = useMutation(
    async (data) => {
      const response = await api.put('/users/change-password', data);
      return response.data;
    },
    {
      onSuccess: () => {
        alert('Password changed successfully! Please login with your new password.');
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 1000);
      },
    }
  );

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateProfileMutation.mutate({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
    });
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    changePasswordMutation.mutate({
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword'),
    });
    e.target.reset();
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1>My Profile</h1>

        <div className="profile-tabs">
          <button
            className={activeTab === 'profile' ? 'active' : ''}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
          <button
            className={activeTab === 'password' ? 'active' : ''}
            onClick={() => setActiveTab('password')}
          >
            Change Password
          </button>
        </div>

        {activeTab === 'profile' && (
          <div className="profile-section">
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>First Name:</label>
                <input
                  type="text"
                  name="firstName"
                  defaultValue={profile?.first_name || ''}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  name="lastName"
                  defaultValue={profile?.last_name || ''}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={profile?.email || ''}
                  className="input"
                />
              </div>

              <button type="submit" className="btn btn-primary" disabled={updateProfileMutation.isLoading}>
                {updateProfileMutation.isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'password' && (
          <div className="profile-section">
            <form onSubmit={handlePasswordChange} className="profile-form">
              <div className="form-group">
                <label>Current Password:</label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  className="input"
                />
              </div>

              <div className="form-group">
                <label>New Password:</label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  minLength={6}
                  className="input"
                />
                <small>Minimum 6 characters</small>
              </div>

              <button type="submit" className="btn btn-primary" disabled={changePasswordMutation.isLoading}>
                {changePasswordMutation.isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

