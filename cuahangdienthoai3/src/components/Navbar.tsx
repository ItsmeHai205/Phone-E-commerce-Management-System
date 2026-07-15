import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShoppingCart, 
  Heart, 
  Sun, 
  Moon, 
  Search, 
  Menu, 
  X,
  Smartphone,
  LayoutDashboard,
  LogIn,
  LogOut,
  Check
} from 'lucide-react';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme, cart, wishlist, user, logout, toast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isBumped, setIsBumped] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const [prevCartCount, setPrevCartCount] = useState(totalCartItems);

  useEffect(() => {
    if (totalCartItems === 0) {
      setPrevCartCount(0);
      return;
    }
    
    if (totalCartItems > prevCartCount) {
      setIsBumped(true);
      const timer = setTimeout(() => {
        setIsBumped(false);
      }, 300);
      setPrevCartCount(totalCartItems);
      return () => clearTimeout(timer);
    }
    
    setPrevCartCount(totalCartItems);
  }, [totalCartItems, prevCartCount]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMobileMenuOpen(false);
    }
  };



  const isActive = (path: string) => {
    return location.pathname === path ? 'active-link' : '';
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-header glass-panel">
      <div className="navbar-container container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <Smartphone className="logo-icon" />
          <span className="logo-text gradient-text">AloPhone</span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search">
          <input
            type="text"
            placeholder="Tìm kiếm điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-btn">
            <Search size={18} />
          </button>
        </form>

        {/* Desktop Navigation Links */}
        <nav className="navbar-nav">
          <Link to="/" className={`nav-link ${isActive('/')}`}>Trang Chủ</Link>
          <Link to="/products" className={`nav-link ${isActive('/products')}`}>Sản Phẩm</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
              <LayoutDashboard size={16} />
              Dashboard
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className="navbar-actions">
          <button onClick={toggleTheme} className="action-btn theme-toggle" title="Đổi giao diện">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <Link to="/products?wishlist=true" className="action-btn wishlist-btn" title="Yêu thích">
            <Heart size={20} />
            {wishlist.length > 0 && <span className="action-badge bg-danger">{wishlist.length}</span>}
          </Link>

          {user && (
            <Link to="/cart" className={`action-btn cart-btn btn-primary ${isBumped ? 'cart-bump' : ''}`} title="Giỏ hàng">
              <ShoppingCart size={20} />
              <span className="cart-label">Giỏ hàng</span>
              {totalCartItems > 0 && <span className="cart-count">{totalCartItems}</span>}
            </Link>
          )}

          {/* User Auth Buttons */}
          {user ? (
            <div className="user-profile-controls">
              <Link to="/profile" className="user-avatar-link" title="Xem hồ sơ cá nhân">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.fullName} className="navbar-avatar" />
                ) : (
                  <div className="navbar-avatar-placeholder">{user.fullName.charAt(0).toUpperCase()}</div>
                )}
              </Link>
              <span className="user-greeting" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }} title="Xem hồ sơ cá nhân">
                Hi, {user.fullName.split(' ').pop()}
              </span>
              <button onClick={handleLogoutClick} className="action-btn logout-btn" title="Đăng xuất">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link to="/login" className="auth-nav-link login">Đăng nhập</Link>
              <Link to="/register" className="auth-nav-link register btn-primary btn-sm">Đăng ký</Link>
            </div>
          )}

          {/* Mobile Menu Toggler */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="action-btn mobile-toggle">
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer glass-panel-heavy">
          <form onSubmit={handleSearchSubmit} className="mobile-search">
            <input
              type="text"
              placeholder="Tìm kiếm điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input"
            />
            <button type="submit" className="mobile-search-btn">
              <Search size={18} />
            </button>
          </form>
          <nav className="mobile-nav">
            <Link to="/" className={`mobile-nav-link ${isActive('/')}`} onClick={() => setMobileMenuOpen(false)}>Trang Chủ</Link>
            <Link to="/products" className={`mobile-nav-link ${isActive('/products')}`} onClick={() => setMobileMenuOpen(false)}>Sản Phẩm</Link>
            
            {user?.role === 'ADMIN' && (
              <Link to="/dashboard" className={`mobile-nav-link ${isActive('/dashboard')}`} onClick={() => setMobileMenuOpen(false)}>
                Quản lý (Dashboard)
              </Link>
            )}

            {user ? (
              <div className="mobile-user-row">
                <div className="mobile-user-profile-info" onClick={() => { navigate('/profile'); setMobileMenuOpen(false); }} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginBottom: '8px' }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="navbar-avatar" />
                  ) : (
                    <div className="navbar-avatar-placeholder">{user.fullName.charAt(0).toUpperCase()}</div>
                  )}
                  <span className="mobile-username">{user.fullName}</span>
                </div>
                <div className="mobile-user-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Trang cá nhân</Link>
                  <button onClick={handleLogoutClick} className="btn btn-secondary btn-sm mobile-logout-btn">
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <div className="mobile-auth-links" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  <LogIn size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Đăng nhập
                </Link>
                <Link to="/register" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>
                  Đăng ký tài khoản
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
      {/* Global Cart Toast */}
      {toast && (
        <div className="global-cart-toast glass-panel-heavy">
          <div className="global-cart-toast-icon">
            <Check size={14} />
          </div>
          <div className="global-cart-toast-body">
            <img 
              src={toast.phoneImage} 
              alt={toast.phoneName} 
              className="global-cart-toast-img" 
            />
            <div className="global-cart-toast-details">
              <span className="global-cart-toast-title">{toast.message}</span>
              <strong className="global-cart-toast-name">{toast.phoneName}</strong>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
