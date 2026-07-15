import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';
import './Footer.css';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="footer glass-panel">
      <div className="container footer-grid">
        {/* Brand Column */}
        <div className="footer-col brand-col">
          <Link to="/" className="footer-logo">
            <Smartphone className="logo-icon" />
            <span className="logo-text gradient-text">AloPhone</span>
          </Link>
          <p className="brand-description">
            AloPhone tự hào là đơn vị cung cấp các thiết bị di động chính hãng cao cấp từ Apple, Samsung, Xiaomi,... với chính sách bảo hành hậu mãi uy tín hàng đầu Việt Nam.
          </p>
        </div>

        {/* Links Column */}
        <div className="footer-col">
          <h4 className="footer-title">Khám Phá</h4>
          <ul className="footer-links">
            <li><Link to="/">Trang Chủ</Link></li>
            <li><Link to="/products">Sản Phẩm</Link></li>
          </ul>
        </div>

        {/* Brands Column */}
        <div className="footer-col">
          <h4 className="footer-title">Thương Hiệu</h4>
          <ul className="footer-links">
            <li><Link to="/products?brand=Apple">Apple iPhone</Link></li>
            <li><Link to="/products?brand=Samsung">Samsung Galaxy</Link></li>
            <li><Link to="/products?brand=Xiaomi">Xiaomi Series</Link></li>
            <li><Link to="/products?brand=Google">Google Pixel</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-col contact-col">
          <h4 className="footer-title">Liên Hệ</h4>
          <ul className="footer-contact-list">
            <li>
              <Phone size={16} />
              <span>Hotline: 1900 1234 (8h - 22h)</span>
            </li>
            <li>
              <Mail size={16} />
              <span>Email: support@alophone.vn</span>
            </li>
            <li>
              <MapPin size={16} />
              <span>Địa chỉ: 123 Đường Cầu Giấy, Hà Nội</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-newsletter container">
        <div className="newsletter-info">
          <h3>Đăng ký nhận tin khuyến mãi</h3>
          <p>Nhận ngay voucher 200k và cập nhật thông tin ưu đãi mới nhất.</p>
        </div>
        
        {subscribed ? (
          <div className="subscribed-success">
            <CheckCircle className="text-success" />
            <span>Cảm ơn bạn đã đăng ký bản tin của chúng tôi!</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="newsletter-form">
            <input
              type="email"
              placeholder="Nhập email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-btn btn-primary">
              <Send size={16} />
              <span>Đăng ký</span>
            </button>
          </form>
        )}
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <div className="footer-socials">
            <span>Bảo mật</span>
            <span>Điều khoản</span>
            <span>Chính sách đổi trả</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
