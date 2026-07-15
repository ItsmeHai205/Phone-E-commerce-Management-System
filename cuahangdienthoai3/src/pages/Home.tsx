import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { formatPrice } from '../data/phones';
import { ProductCard } from '../components/ProductCard';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Headphones, 
  ArrowRight, 
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { products } = useApp();
  const [activeTab, setActiveTab] = useState<'all' | 'new' | 'bestseller' | 'hotdeal'>('all');
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  // Hero banners data using real mock phones
  const heroPhones = products.filter(p => p.tag === 'Best Seller' || p.tag === 'Hot Deal' || p.tag === 'New').slice(0, 3);

  // Flash Sale Countdown Timer (set to end in 24 hours)
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Automatic hero slider cycle (every 6 seconds)
  useEffect(() => {
    if (heroPhones.length === 0) return;
    const heroCycle = setInterval(() => {
      setCurrentHeroIndex(prev => (prev + 1) % heroPhones.length);
    }, 6000);
    return () => clearInterval(heroCycle);
  }, [heroPhones.length]);

  // Filter products based on active tab
  const getFilteredProducts = () => {
    if (activeTab === 'all') return products.slice(0, 4);
    if (activeTab === 'new') return products.filter(p => p.tag === 'New');
    if (activeTab === 'bestseller') return products.filter(p => p.tag === 'Best Seller');
    if (activeTab === 'hotdeal') return products.filter(p => p.tag === 'Hot Deal');
    return products;
  };

  const handleBrandClick = (brandName: string) => {
    navigate(`/products?brand=${brandName}`);
  };

  // Brands list
  const brands = ['Apple', 'Samsung', 'Xiaomi', 'OnePlus', 'Google'];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section container">
        <AnimatePresence mode="wait">
          {heroPhones.length > 0 && (
            <motion.div
              key={currentHeroIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="hero-slider glass-panel-heavy"
            >
              <div className="hero-content">
                <div className="hero-tag">
                  <Sparkles size={14} className="text-secondary" />
                  <span>{heroPhones[currentHeroIndex].tag}</span>
                </div>
                <h1 className="hero-title">{heroPhones[currentHeroIndex].name}</h1>
                <p className="hero-desc">{heroPhones[currentHeroIndex].description}</p>
                <div className="hero-price-group">
                  <span className="hero-price-label">Giá chỉ từ</span>
                  <span className="hero-price-val">
                    {formatPrice(heroPhones[currentHeroIndex].basePrice * (1 - heroPhones[currentHeroIndex].discount / 100))}
                  </span>
                </div>
                <div className="hero-buttons">
                  <Link to={`/product/${heroPhones[currentHeroIndex].id}`} className="btn btn-primary btn-lg">
                    Mua Ngay
                    <ArrowRight size={18} />
                  </Link>
                  <Link to="/products" className="btn btn-secondary btn-lg">
                    Xem Thêm
                  </Link>
                </div>
              </div>
              
              <div className="hero-image-wrapper">
                <img 
                  src={heroPhones[currentHeroIndex].image} 
                  alt={heroPhones[currentHeroIndex].name} 
                  className="hero-image" 
                />
                <div className="hero-image-shadow"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Dots */}
        <div className="hero-dots">
          {heroPhones.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentHeroIndex(index)}
              className={`hero-dot ${index === currentHeroIndex ? 'active' : ''}`}
            ></button>
          ))}
        </div>
      </section>

      {/* Brand Navigation Section */}
      <section className="brands-section container">
        <h2 className="section-title text-center">Thương Hiệu Nổi Bật</h2>
        <div className="brands-grid">
          {brands.map((brand, i) => (
            <motion.div
              key={brand}
              onClick={() => handleBrandClick(brand)}
              className="brand-card glass-panel"
              whileHover={{ scale: 1.05, borderColor: 'var(--primary-color)' }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <span className="brand-logo-text">{brand}</span>
              <span className="brand-explore">Khám phá <ArrowRight size={14} /></span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Flash Sale Section */}
      <section className="flash-sale-section container">
        <div className="flash-sale-banner glass-panel">
          <div className="flash-sale-info">
            <div className="flash-badge badge-hotdeal badge">
              <Clock size={14} />
              <span>FLASH SALE</span>
            </div>
            <h2>Ưu Đãi Lớn Trong Ngày</h2>
            <p>Đừng bỏ lỡ giảm giá lên tới 15% cho các siêu phẩm mới nhất.</p>
            
            {/* Countdown timer */}
            <div className="countdown-container">
              <div className="countdown-box">
                <span className="countdown-time">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="countdown-label">Giờ</span>
              </div>
              <span className="countdown-divider">:</span>
              <div className="countdown-box">
                <span className="countdown-time">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="countdown-label">Phút</span>
              </div>
              <span className="countdown-divider">:</span>
              <div className="countdown-box">
                <span className="countdown-time">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="countdown-label">Giây</span>
              </div>
            </div>
          </div>

          <div className="flash-sale-products">
            {products.filter(p => p.discount >= 10).slice(0, 2).map(phone => (
              <div key={phone.id} className="flash-product-wrapper">
                <ProductCard phone={phone} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Tabs */}
      <section className="featured-section container">
        <div className="section-header-row">
          <h2 className="section-title">Gợi Ý Cho Bạn</h2>
          <div className="tabs-container">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              Tất Cả
            </button>
            <button 
              onClick={() => setActiveTab('new')} 
              className={`tab-btn ${activeTab === 'new' ? 'active' : ''}`}
            >
              Mới Về
            </button>
            <button 
              onClick={() => setActiveTab('bestseller')} 
              className={`tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`}
            >
              Bán Chạy
            </button>
            <button 
              onClick={() => setActiveTab('hotdeal')} 
              className={`tab-btn ${activeTab === 'hotdeal' ? 'active' : ''}`}
            >
              Khuyến Mãi Hot
            </button>
          </div>
        </div>

        <motion.div 
          layout
          className="products-grid"
        >
          <AnimatePresence mode="popLayout">
            {getFilteredProducts().map(phone => (
              <motion.div
                layout
                key={phone.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <ProductCard phone={phone} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Trust Vouchers Banner */}
      <section className="trust-features-section container">
        <div className="trust-grid">
          <div className="trust-card glass-panel">
            <div className="trust-icon-wrapper text-primary">
              <Truck size={24} />
            </div>
            <div>
              <h3>Giao hàng miễn phí</h3>
              <p>Mọi đơn hàng từ 10.000.000đ trên toàn quốc</p>
            </div>
          </div>
          <div className="trust-card glass-panel">
            <div className="trust-icon-wrapper text-secondary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3>Bảo hành 12 tháng</h3>
              <p>Chính hãng 100%, 1 đổi 1 trong 30 ngày lỗi</p>
            </div>
          </div>
          <div className="trust-card glass-panel">
            <div className="trust-icon-wrapper text-warning">
              <RotateCcw size={24} />
            </div>
            <div>
              <h3>Dễ dàng đổi trả</h3>
              <p>Hỗ trợ hoàn tiền nhanh nếu không ưng ý</p>
            </div>
          </div>
          <div className="trust-card glass-panel">
            <div className="trust-icon-wrapper text-success">
              <Headphones size={24} />
            </div>
            <div>
              <h3>Hỗ trợ 24/7</h3>
              <p>Đội ngũ chuyên nghiệp giải quyết nhanh</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
