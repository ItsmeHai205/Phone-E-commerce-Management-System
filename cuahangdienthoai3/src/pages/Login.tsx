import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { LogIn, User, Lock, AlertCircle } from 'lucide-react';
import './Login.css';

export const Login: React.FC = () => {
  const { login, user } = useApp();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If already logged in, redirect appropriate path
  React.useEffect(() => {
    if (user) {
      if (user.role === 'ADMIN') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ tên tài khoản và mật khẩu!');
      return;
    }

    setLoading(true);

    try {
      // Connect to Spring Boot backend API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const userData = await response.json();
        // Backend returns user details
        login({
          username: userData.username,
          fullName: userData.fullName,
          role: userData.role,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          avatar: userData.avatar,
          purchasedPhoneIds: userData.purchasedPhoneIds
        });
      } else {
        const errMsg = await response.text();
        setError(errMsg || 'Tài khoản hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      // Fallback Mock Local Auth if backend server is not running
      console.log('Backend connection failed, falling back to mock auth.', err);
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));

      if (username === 'admin' && password === 'admin') {
        login({
          username: 'admin',
          fullName: 'Quản Trị Viên',
          role: 'ADMIN'
        });
      } else if (username === 'user' && password === '123456') {
        login({
          username: 'user',
          fullName: 'Khách Hàng Thân Thiết',
          role: 'USER'
        });
      } else {
        setError('Tài khoản hoặc mật khẩu không đúng! Thử: admin/admin hoặc user/123456');
      }
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="login-page container">
      <div className="login-card glass-panel-heavy glow-animation">
        <div className="login-header">
          <div className="login-icon-wrapper">
            <LogIn size={28} />
          </div>
          <h2>Đăng Nhập Hệ Thống</h2>
          <p>Truy cập tài khoản AloPhone của bạn</p>
        </div>

        {error && (
          <div className="login-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Tên tài khoản</label>
            <div className="input-wrapper">
              <User size={16} className="input-icon" />
              <input
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="form-input with-icon"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input with-icon"
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full login-submit-btn" disabled={loading}>
            {loading ? <div className="spinner"></div> : 'Đăng Nhập'}
          </button>
        </form>

        <div className="login-divider-line">
          <span>Chưa có tài khoản?</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <Link to="/register" className="btn btn-secondary w-full" style={{ display: 'block', textDecoration: 'none' }}>
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
};
