import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserIcon, Bars3Icon, XMarkIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            <h1>E-Commerce Store</h1>
          </Link>

          <button 
            className="mobile-menu-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <XMarkIcon className="icon" /> : <Bars3Icon className="icon" />}
          </button>

          <ul className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
              {user && user.role === 'admin' ? null : <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>}
              {user && user.role === 'admin' ? null : <li><Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link></li>}

            {user ? (
              user.role === 'admin' ? (
                <>
                  <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Dashboard</Link></li>
                  <li className="user-menu">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <UserIcon className="icon" />
                      {user.firstName}
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link to="/cart" onClick={() => setMenuOpen(false)} className="cart-link">
                      <ShoppingCartIcon className="icon" />
                    </Link>
                  </li>
                  <li><Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link></li>
                  <li className="user-menu">
                    <Link to="/profile" onClick={() => setMenuOpen(false)}>
                      <UserIcon className="icon" />
                      {user.firstName}
                    </Link>
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                  </li>
                </>
              )
            ) : (
              <>
                <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
                <li><Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-primary">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

