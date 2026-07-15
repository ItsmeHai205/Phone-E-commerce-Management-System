import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { UserPlus, User, Lock, Mail, Phone, MapPin, AlertCircle, CheckCircle } from 'lucide-react';
import './Register.css';

export const Register: React.FC = () => {
  const { user } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
    avatar: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Tên đăng nhập và mật khẩu là bắt buộc!');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không trùng khớp!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: formData.avatar
        }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        const errMsg = await response.text();
        setError(errMsg || 'Đăng ký tài khoản thất bại!');
      }
    } catch (err) {
      console.log('Backend connection failed, falling back to mock registration.', err);
      // Fallback local mock simulation
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (formData.username.toLowerCase() === 'admin' || formData.username.toLowerCase() === 'user') {
        setError('Tài khoản demo đã tồn tại trên hệ thống!');
      } else {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page container">
      <div className="register-card glass-panel-heavy glow-animation">
        <div className="register-header">
          <div className="register-icon-wrapper">
            <UserPlus size={28} />
          </div>
          <h2>Đăng Ký Tài Khoản</h2>
          <p>Trở thành thành viên của AloPhone</p>
        </div>

        {error && (
          <div className="register-error-alert">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="register-success-alert">
            <CheckCircle size={16} />
            <span>Đăng ký thành công! Đang chuyển hướng về trang đăng nhập...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-grid-2col">
            <div className="form-group">
              <label>Tên tài khoản *</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Họ và tên *</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu *</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Xác nhận mật khẩu *</label>
              <div className="input-wrapper">
                <Lock size={16} className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail size={16} className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="viethong@alophone.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <div className="input-wrapper">
                <Phone size={16} className="input-icon" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="09xx xxx xxx"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group col-span-2">
              <label>Ảnh đại diện (URL hình ảnh)</label>
              <div className="input-wrapper">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  name="avatar"
                  placeholder="https://images.unsplash.com/photo-xxx"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  disabled={loading || success}
                />
              </div>
            </div>

            <div className="form-group col-span-2">
              <label>Địa chỉ giao hàng mặc định</label>
              <div className="input-wrapper">
                <MapPin size={16} className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input with-icon"
                  disabled={loading || success}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg w-full register-submit-btn" disabled={loading || success}>
            {loading ? <div className="spinner"></div> : 'Đăng Ký'}
          </button>
        </form>

        <div className="register-footer" style={{ textAlign: 'center', marginTop: '20px' }}>
          <span>Đã có tài khoản? </span>
          <Link to="/login" className="login-link" style={{ fontWeight: '600', color: 'var(--primary-color)' }}>
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
