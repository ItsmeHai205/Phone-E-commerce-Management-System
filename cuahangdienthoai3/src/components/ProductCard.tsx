import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/phones';
import type { Phone } from '../data/phones';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import './ProductCard.css';

interface ProductCardProps {
  phone: Phone;
}

export const ProductCard: React.FC<ProductCardProps> = ({ phone }) => {
  const { wishlist, toggleWishlist, addToCart, user } = useApp();
  const [isAdded, setIsAdded] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; speed: number; size: number; symbol: string }[]>([]);
  const navigate = useNavigate();

  const isFavorite = wishlist.includes(phone.id);

  const discountedPrice = phone.basePrice * (1 - phone.discount / 100);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(phone.id);
  };

  const triggerParticles = () => {
    setIsAdded(true);
    const symbols = ['★', '✦', '✨', '•'];
    const newParticles = Array.from({ length: 12 }).map((_, i) => ({
      id: Math.random(),
      angle: (i * 360) / 12 + Math.random() * 15 - 7.5,
      speed: 35 + Math.random() * 45,
      size: 10 + Math.random() * 10,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setIsAdded(false);
      setParticles([]);
    }, 1000);
  };

  const handleQuickAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    if (isAdded) return;

    // Quick add default options: first color, first storage
    const defaultColor = phone.colors[0];
    const defaultStorage = phone.storage[0];
    addToCart(phone, defaultColor, defaultStorage, 1);
    
    triggerParticles();
  };

  // Get tag class name
  const getTagClass = () => {
    switch (phone.tag) {
      case 'New': return 'badge-new';
      case 'Best Seller': return 'badge-bestseller';
      case 'Hot Deal': return 'badge-hotdeal';
      default: return '';
    }
  };

  return (
    <motion.div 
      className="product-card glass-panel"
      whileHover={{ y: -6, boxShadow: 'var(--shadow-lg)' }}
      transition={{ duration: 0.3 }}
    >
      <Link to={`/product/${phone.id}`} className="card-link">
        {/* Badges */}
        <div className="card-badges">
          {phone.tag !== 'None' && (
            <span className={`badge ${getTagClass()}`}>
              {phone.tag}
            </span>
          )}
          {phone.discount > 0 && (
            <span className="badge badge-discount">
              -{phone.discount}%
            </span>
          )}
        </div>

        {/* Action Overlays */}
        <div className="card-actions-overlay">
          <button 
            onClick={handleWishlistClick} 
            className={`overlay-btn wishlist-btn ${isFavorite ? 'active' : ''}`}
            title="Thêm vào yêu thích"
          >
            <Heart size={16} fill={isFavorite ? 'var(--danger-color)' : 'none'} />
          </button>
        </div>

        {/* Product Image */}
        <div className="card-image-wrapper">
          <img src={phone.image} alt={phone.name} className="card-image" loading="lazy" />
        </div>

        {/* Product Info */}
        <div className="card-info">
          <span className="card-brand">{phone.brand}</span>
          <h3 className="card-title">{phone.name}</h3>

          {/* Rating */}
          <div className="card-rating">
            <div className="stars">
              <Star size={14} fill="var(--warning-color)" color="var(--warning-color)" />
              <span className="rating-value">{phone.rating}</span>
            </div>
            <span className="reviews-count">({phone.reviewsCount} đánh giá)</span>
          </div>

          {/* Pricing */}
          <div className="card-pricing">
            {phone.discount > 0 ? (
              <>
                <span className="price-sale">{formatPrice(discountedPrice)}</span>
                <span className="price-original">{formatPrice(phone.basePrice)}</span>
              </>
            ) : (
              <span className="price-sale">{formatPrice(phone.basePrice)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Quick Add To Cart Button */}
      <div className="card-footer">
        <button 
          onClick={handleQuickAddCart} 
          className={`btn quick-add-btn btn-sm ${isAdded ? 'btn-success added-pop' : 'btn-primary'}`}
          disabled={isAdded}
          style={{ position: 'relative', overflow: 'visible' }}
        >
          {isAdded ? (
            <>
              <Check size={14} />
              <span>Đã thêm!</span>
            </>
          ) : (
            <>
              <ShoppingCart size={14} />
              <span>Thêm vào giỏ</span>
            </>
          )}

          {/* Particle Explosion */}
          {particles.map((p) => {
            const radian = (p.angle * Math.PI) / 180;
            const x = Math.cos(radian) * p.speed;
            const y = Math.sin(radian) * p.speed;
            return (
              <motion.span
                key={p.id}
                initial={{ x: -p.size / 2, y: -p.size / 2, opacity: 1, scale: 0.3 }}
                animate={{ x: x, y: y, opacity: 0, scale: 1.5, rotate: 360 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  color: '#fbbf24',
                  fontSize: `${p.size}px`,
                  pointerEvents: 'none',
                  zIndex: 100,
                  textShadow: '0 0 6px rgba(251, 191, 36, 0.8)'
                }}
              >
                {p.symbol}
              </motion.span>
            );
          })}
        </button>
      </div>
    </motion.div>
  );
};
