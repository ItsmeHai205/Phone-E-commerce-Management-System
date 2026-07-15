import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/phones';
import { useApp } from '../context/AppContext';
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  ChevronRight, 
  ShieldCheck, 
  RotateCcw, 
  Truck,
  Plus,
  Minus,
  Check
} from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { motion } from 'framer-motion';
import './ProductDetail.css';

export const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addToCart, wishlist, toggleWishlist, products, user, setProducts } = useApp();
  const navigate = useNavigate();

  const phone = products.find(p => p.id === id);

  // If phone not found, redirect or show error
  if (!phone) {
    return (
      <div className="container not-found-container text-center">
        <h2>Không tìm thấy sản phẩm</h2>
        <p>Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
        <Link to="/products" className="btn btn-primary">Quay lại cửa hàng</Link>
      </div>
    );
  }

  // Active configurations
  const [selectedColor, setSelectedColor] = useState(phone.colors[0]);
  const [selectedStorage, setSelectedStorage] = useState(phone.storage[0]);
  const [activeImage, setActiveImage] = useState(phone.image);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isAdded, setIsAdded] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number; speed: number; size: number; symbol: string }[]>([]);

  // Reviews integration states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [submittingReview, setSubmittingReview] = useState<boolean>(false);

  const fetchReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/phone/${phone.id}`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  const updateProductsCache = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/phones');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error('Failed to refresh products context:', err);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Vui lòng đăng nhập để đánh giá sản phẩm!');
      return;
    }
    if (!commentInput.trim()) {
      alert('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    setSubmittingReview(true);
    const newReview = {
      phoneId: phone.id,
      username: user.username,
      fullName: user.fullName || user.username,
      rating: ratingInput,
      comment: commentInput
    };

    try {
      const response = await fetch('http://localhost:8080/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newReview)
      });
      if (response.ok) {
        setCommentInput('');
        setRatingInput(5);
        await fetchReviews();
        await updateProductsCache();
        alert('Cảm ơn bạn đã đánh giá sản phẩm!');
      } else {
        alert('Không thể gửi đánh giá, vui lòng thử lại sau!');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      alert('Lỗi kết nối mạng khi gửi đánh giá!');
    } finally {
      setSubmittingReview(false);
    }
  };

  const renderRatingStars = (ratingVal: number, size = 16) => {
    const rounded = Math.round(ratingVal);
    return Array.from({ length: 5 }).map((_, i) => {
      const isFilled = i < rounded;
      return (
        <Star 
          key={i} 
          size={size} 
          fill={isFilled ? "var(--warning-color)" : "none"} 
          color="var(--warning-color)" 
        />
      );
    });
  };

  useEffect(() => {
    fetchReviews();
  }, [phone.id]);

  // Sync active image with selected color image
  useEffect(() => {
    setActiveImage(selectedColor.image);
  }, [selectedColor]);

  // Sync state if id change (navigating to recommended product)
  useEffect(() => {
    setSelectedColor(phone.colors[0]);
    setSelectedStorage(phone.storage[0]);
    setActiveImage(phone.image);
    setQuantity(1);
  }, [phone]);

  const isFavorite = wishlist.includes(phone.id);

  // Calculate actual price with discount & storage offset
  const discountMultiplier = 1 - phone.discount / 100;
  const currentBasePrice = phone.basePrice + selectedStorage.priceOffset;
  const finalPrice = currentBasePrice * discountMultiplier;
  const originalPrice = currentBasePrice;

  const handleQuantityChange = (val: number) => {
    if (val < 1) return;
    setQuantity(val);
  };

  const triggerParticles = () => {
    setIsAdded(true);
    const symbols = ['★', '✦', '✨', '•'];
    const newParticles = Array.from({ length: 16 }).map((_, i) => ({
      id: Math.random(),
      angle: (i * 360) / 16 + Math.random() * 15 - 7.5,
      speed: 50 + Math.random() * 70,
      size: 12 + Math.random() * 12,
      symbol: symbols[Math.floor(Math.random() * symbols.length)]
    }));
    setParticles(newParticles);

    setTimeout(() => {
      setIsAdded(false);
      setParticles([]);
    }, 1000);
  };

  const handleAddCart = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (isAdded) return;
    addToCart(phone, selectedColor, selectedStorage, quantity);
    triggerParticles();
  };

  // Get recommended products (same brand or price range, exclude current)
  const recommendedPhones = products
    .filter(p => p.id !== phone.id && (p.brand === phone.brand || Math.abs(p.basePrice - phone.basePrice) < 8000000))
    .slice(0, 4);


  return (
    <div className="product-detail-page container">
      {/* Breadcrumb */}
      <nav className="breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/products">Sản phẩm</Link>
        <ChevronRight size={14} />
        <Link to={`/products?brand=${phone.brand}`}>{phone.brand}</Link>
        <ChevronRight size={14} />
        <span>{phone.name}</span>
      </nav>

      {/* Main product presentation */}
      <div className="product-showcase">
        {/* Left Side: Images */}
        <div className="showcase-images-column">
          <div className="main-image-panel glass-panel">
            {phone.discount > 0 && (
              <span className="badge badge-discount detail-discount-badge">
                Khuyến mãi -{phone.discount}%
              </span>
            )}
            <img src={activeImage} alt={phone.name} className="detail-main-image" />
          </div>

          <div className="gallery-thumbnails">
            {/* Show color images first, then remaining gallery images */}
            {phone.colors.map((c, idx) => (
              <button 
                key={`col-thumb-${idx}`} 
                onClick={() => {
                  setSelectedColor(c);
                  setActiveImage(c.image);
                }}
                className={`thumb-btn glass-panel ${activeImage === c.image ? 'active' : ''}`}
              >
                <img src={c.image} alt={c.name} />
              </button>
            ))}
            {phone.images.filter(img => !phone.colors.some(c => c.image === img)).map((img, idx) => (
              <button 
                key={`gal-thumb-${idx}`} 
                onClick={() => setActiveImage(img)}
                className={`thumb-btn glass-panel ${activeImage === img ? 'active' : ''}`}
              >
                <img src={img} alt="Gallery" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Options & Actions */}
        <div className="showcase-options-column">
          <span className="detail-brand">{phone.brand}</span>
          <h1 className="detail-name">{phone.name}</h1>

          {/* Rating overview */}
          <div className="detail-rating-row">
            <div className="stars">
              <Star size={16} fill="var(--warning-color)" color="var(--warning-color)" />
              <span className="rating-value">{phone.rating}</span>
            </div>
            <span className="divider">|</span>
            <span className="reviews-count">{phone.reviewsCount} Đánh giá</span>
            <span className="divider">|</span>
            <span className={`stock-status ${phone.stock > 0 ? 'in-stock' : 'out-stock'}`}>
              {phone.stock > 0 ? `Còn hàng (${phone.stock} máy)` : 'Hết hàng'}
            </span>
          </div>

          {/* Price display */}
          <div className="detail-price-panel glass-panel">
            <div className="pricing">
              <span className="price-sale">{formatPrice(finalPrice)}</span>
              {phone.discount > 0 && (
                <span className="price-original">{formatPrice(originalPrice)}</span>
              )}
            </div>
            {phone.discount > 0 && (
              <span className="price-save-desc">
                Tiết kiệm: {formatPrice(originalPrice - finalPrice)}
              </span>
            )}
          </div>

          {/* Color Selector */}
          <div className="option-select-group">
            <h4 className="option-title">Màu sắc: <span>{selectedColor.name}</span></h4>
            <div className="color-options-row">
              {phone.colors.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c)}
                  className={`color-bubble-btn ${selectedColor.name === c.name ? 'active' : ''}`}
                  style={{ '--color-hex': c.hex } as React.CSSProperties}
                  title={c.name}
                >
                  {selectedColor.name === c.name && <Check size={14} className="check-icon" />}
                </button>
              ))}
            </div>
          </div>

          {/* Storage / Version Selector */}
          <div className="option-select-group">
            <h4 className="option-title">Bộ nhớ (ROM): <span>{selectedStorage.size}</span></h4>
            <div className="storage-options-row">
              {phone.storage.map((st) => (
                <button
                  key={st.size}
                  onClick={() => setSelectedStorage(st)}
                  className={`storage-pill-btn glass-panel ${selectedStorage.size === st.size ? 'active' : ''}`}
                >
                  <span className="storage-size">{st.size}</span>
                  {st.priceOffset > 0 && (
                    <span className="storage-offset">+{formatPrice(st.priceOffset)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="option-select-group">
            <h4 className="option-title">Số lượng:</h4>
            <div className="quantity-counter">
              <button 
                onClick={() => handleQuantityChange(quantity - 1)} 
                className="counter-btn"
                disabled={quantity <= 1}
              >
                <Minus size={16} />
              </button>
              <span className="counter-val">{quantity}</span>
              <button 
                onClick={() => handleQuantityChange(quantity + 1)} 
                className="counter-btn"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Core Action Buttons */}
          <div className="detail-actions-row">
            <button 
              onClick={handleAddCart} 
              className={`btn buy-now-btn btn-lg ${isAdded ? 'btn-success added-pop' : 'btn-primary'}`}
              disabled={phone.stock === 0 || isAdded}
              style={{ position: 'relative', overflow: 'visible' }}
            >
              {isAdded ? (
                <>
                  <Check size={20} />
                  <span>ĐÃ THÊM VÀO GIỎ!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={20} />
                  <span>THÊM VÀO GIỎ HÀNG</span>
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

            <button 
              onClick={() => toggleWishlist(phone.id)} 
              className={`action-icon-btn glass-panel ${isFavorite ? 'active' : ''}`}
              title="Yêu thích"
            >
              <Heart size={20} fill={isFavorite ? 'var(--danger-color)' : 'none'} />
            </button>
          </div>

          {/* Additional details */}
          <div className="detail-shipping-vouchers">
            <div className="ship-row">
              <Truck size={18} />
              <div>
                <strong>Miễn phí vận chuyển toàn quốc</strong>
                <p>Giao nhanh siêu tốc 2-4 ngày làm việc</p>
              </div>
            </div>
            <div className="ship-row">
              <ShieldCheck size={18} />
              <div>
                <strong>Bảo hành chính hãng 12 tháng</strong>
                <p>Cam kết hàng mới chính hãng 100%, bảo hành tại trung tâm ủy quyền</p>
              </div>
            </div>
            <div className="ship-row">
              <RotateCcw size={18} />
              <div>
                <strong>Đổi trả 1 đổi 1 trong 30 ngày</strong>
                <p>Hỗ trợ đổi trả miễn phí nếu phát sinh lỗi phần cứng nhà sản xuất</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <section className="detail-tabs-section">
        <div className="tabs-header-border">
          <div className="tabs-headers">
            <button 
              onClick={() => setActiveTab('desc')} 
              className={`tab-header-btn ${activeTab === 'desc' ? 'active' : ''}`}
            >
              Mô tả chi tiết
            </button>
            <button 
              onClick={() => setActiveTab('specs')} 
              className={`tab-header-btn ${activeTab === 'specs' ? 'active' : ''}`}
            >
              Thông số kỹ thuật
            </button>
            <button 
              onClick={() => setActiveTab('reviews')} 
              className={`tab-header-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            >
              Đánh giá ({phone.reviewsCount})
            </button>
          </div>
        </div>

        <div className="tab-body-content glass-panel">
          {activeTab === 'desc' && (
            <div className="description-tab-content">
              <p>{phone.description}</p>
              <p style={{ marginTop: '15px' }}>
                Được thiết kế tinh tế với độ hoàn thiện hoàn hảo, đây chính là sự lựa chọn tối ưu cho những ai đang tìm kiếm một thiết bị di động đẳng cấp, vừa phục vụ tốt nhu cầu công việc vừa thỏa mãn trải nghiệm giải trí đỉnh cao hàng ngày.
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <table className="specs-table">
              <tbody>
                <tr>
                  <td>Màn hình</td>
                  <td>{phone.specs.screen}</td>
                </tr>
                <tr>
                  <td>Bộ vi xử lý (CPU)</td>
                  <td>{phone.specs.cpu}</td>
                </tr>
                <tr>
                  <td>Dung lượng RAM</td>
                  <td>{phone.specs.ram}</td>
                </tr>
                <tr>
                  <td>Bộ nhớ trong</td>
                  <td>{phone.specs.rom}</td>
                </tr>
                <tr>
                  <td>Dung lượng Pin</td>
                  <td>{phone.specs.battery}</td>
                </tr>
                <tr>
                  <td>Camera sau</td>
                  <td>{phone.specs.camera}</td>
                </tr>
                <tr>
                  <td>Hệ điều hành</td>
                  <td>{phone.specs.os}</td>
                </tr>
                <tr>
                  <td>Trọng lượng</td>
                  <td>{phone.specs.weight}</td>
                </tr>
              </tbody>
            </table>
          )}

          {activeTab === 'reviews' && (
            <div className="reviews-tab-content">
              <div className="reviews-summary-block">
                <div className="summary-left">
                  <span className="big-rating">{phone.rating}</span>
                  <div className="stars-row">
                    {renderRatingStars(phone.rating, 16)}
                  </div>
                  <span className="label">Điểm đánh giá trung bình ({phone.reviewsCount} đánh giá)</span>
                </div>
              </div>

              {loadingReviews ? (
                <div style={{ padding: '20px 0', color: 'var(--text-muted)' }}>Đang tải đánh giá...</div>
              ) : reviews.length === 0 ? (
                <div style={{ padding: '20px 0', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên đánh giá!
                </div>
              ) : (
                <div className="reviews-list">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="review-comment-card">
                      <div className="comment-meta">
                        <strong>{rev.fullName || rev.username}</strong>
                        <span className="comment-date">{rev.date}</span>
                      </div>
                      <div className="comment-stars">
                        {renderRatingStars(rev.rating, 12)}
                      </div>
                      <p className="comment-text">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Write review form */}
              <div className="write-review-form-panel glass-panel" style={{ marginTop: '30px', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--border-rgb), 0.5)' }}>
                <h4 style={{ marginBottom: '16px', fontSize: '1.1rem', fontWeight: '700', fontFamily: 'var(--font-display)' }}>Viết đánh giá của bạn</h4>
                {user ? (
                  <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Đánh giá của bạn:</span>
                      <div className="rating-star-selector" style={{ display: 'flex', gap: '4px' }}>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const starValue = i + 1;
                          const isGold = hoveredStar !== null ? starValue <= hoveredStar : starValue <= ratingInput;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setRatingInput(starValue)}
                              onMouseEnter={() => setHoveredStar(starValue)}
                              onMouseLeave={() => setHoveredStar(null)}
                              style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'transform 0.1s' }}
                            >
                              <Star
                                size={22}
                                fill={isGold ? "var(--warning-color)" : "none"}
                                color="var(--warning-color)"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Nội dung đánh giá</label>
                      <textarea
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (chất lượng, camera, pin, độ mượt...)"
                        style={{
                          width: '100%',
                          minHeight: '100px',
                          padding: '12px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(var(--border-rgb), 0.5)',
                          background: 'rgba(var(--bg-rgb), 0.6)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          fontSize: '0.9rem',
                          resize: 'vertical'
                        }}
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submittingReview}
                      className="btn btn-primary"
                      style={{ alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.85rem' }}
                    >
                      {submittingReview ? 'Đang gửi...' : 'Gửi Đánh Giá'}
                    </button>
                  </form>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '15px 0' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Vui lòng đăng nhập tài khoản để đánh giá sản phẩm.</p>
                    <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '8px 20px' }}>Đăng nhập ngay</Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="recommendations-section">
        <h2 className="section-title">Sản Phẩm Tương Tự</h2>
        <div className="products-grid">
          {recommendedPhones.map(recPhone => (
            <ProductCard key={recPhone.id} phone={recPhone} />
          ))}
        </div>
      </section>
    </div>
  );
};
