import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  React.useEffect(() => {
    if (user) {
      // Fetch cart count
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/cart`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.items) {
            setCartCount(data.items.length);
          }
        })
        .catch(() => {});
    }
  }, [user]);

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
            <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
            <li><Link to="/products" onClick={() => setMenuOpen(false)}>Products</Link></li>
            
            {user ? (
              <>
                <li>
                  <Link to="/cart" onClick={() => setMenuOpen(false)} className="cart-link">
                    <ShoppingCartIcon className="icon" />
                    {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                  </Link>
                </li>
                <li>
                  <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
                </li>
                {user.role === 'admin' && (
                  <li><Link to="/admin" onClick={() => setMenuOpen(false)}>Admin</Link></li>
                )}
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

