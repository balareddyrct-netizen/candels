import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/AppContext';
import { useAuth } from '../context/AppContext';
import { useToast } from '../context/AppContext';
import './Navbar.css';

export default function Navbar() {
  const [solid, setSolid]           = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { cartCount }  = useCart();
  const { user, signOut, isLoggedIn, isAdmin } = useAuth();
  const showToast = useToast();
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenuOpen) return;
    const close = (e) => {
      if (!e.target.closest('.user-menu-wrap')) setUserMenuOpen(false);
    };
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [userMenuOpen]);

  const isActive = (path) => location.pathname === path ? 'active' : '';

  const handleSignOut = () => {
    signOut();
    showToast('Signed out. See you soon!');
    navigate('/');
  };

  const displayName = user ? (user.displayName || user.email?.split('@')[0] || 'U') : '';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <nav className={`navbar ${solid ? 'solid' : ''}`}>
        <Link to="/" className="nav-logo">
          <img src="/images/logo.jpg" alt="Sugandhika" className="nav-logo-img" />
          <span className="nav-logo-text">Sugandhika</span>
        </Link>

        <ul className="nav-links">
          <li><Link to="/collection" className={isActive('/collection')}>Collection</Link></li>
          <li><Link to="/customize"  className={isActive('/customize')}>Customize</Link></li>
          <li><Link to="/story"      className={isActive('/story')}>Our Story</Link></li>
          <li><Link to="/ritual"     className={isActive('/ritual')}>Ritual</Link></li>
        </ul>

        <div className="nav-right">
          {/* Cart */}
          <Link to="/cart" className="nav-cart">
            Cart
            {cartCount > 0 && <span className="cart-dot">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <div className="user-menu-wrap">
              <button
                className="user-avatar-btn"
                onClick={() => setUserMenuOpen(o => !o)}
                title={displayName}
              >
                {initials}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{displayName}</div>
                    <div className="user-dropdown-email">{user.email}</div>
                  </div>
                  {isAdmin && (
                    <Link to="/admin" className="user-dropdown-item" style={{ color: 'var(--accent)' }}>Admin Panel</Link>
                  )}
                  <Link to="/account" className="user-dropdown-item">My Account</Link>
                  <Link to="/cart"    className="user-dropdown-item">My Cart {cartCount > 0 && `(${cartCount})`}</Link>
                  <button className="user-dropdown-item user-dropdown-signout" onClick={handleSignOut}>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nav-auth-links">
              <Link to="/signin" className="nav-auth-link">Sign In</Link>
              <Link to="/signup" className="nav-auth-link nav-auth-signup">Sign Up</Link>
            </div>
          )}

          {/* Mobile burger */}
          <button
            className={`nav-burger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile nav */}
      <div className={`mobile-nav ${mobileOpen ? 'open' : ''}`}>
        <Link to="/">Home</Link>
        <Link to="/collection">Collection</Link>
        <Link to="/customize">Customize</Link>
        <Link to="/story">Story</Link>
        <Link to="/ritual">Ritual</Link>
        <Link to="/cart">Cart {cartCount > 0 && `(${cartCount})`}</Link>
        {isLoggedIn ? (
          <>
            {isAdmin && <Link to="/admin" style={{ color: 'var(--accent)' }}>Admin Panel</Link>}
            <Link to="/account">My Account</Link>
            <button className="mobile-signout" onClick={handleSignOut}>Sign Out</button>
          </>
        ) : (
          <>
            <Link to="/signin">Sign In</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </>
  );
}
