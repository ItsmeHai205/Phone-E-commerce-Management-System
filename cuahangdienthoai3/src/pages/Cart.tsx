import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/phones';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, Ticket, Check } from 'lucide-react';
import './Cart.css';

export const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, clearCart } = useApp();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountVal: number; type: 'percentage' | 'fixed' } | null>(null);
  const [promoError, setPromoError] = useState('');

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => {
      const discountMultiplier = 1 - item.phone.discount / 100;
      const unitPrice = (item.phone.basePrice + item.selectedStorage.priceOffset) * discountMultiplier;
      return total + unitPrice * item.quantity;
    }, 0);
  };

  const subtotal = calculateSubtotal();

  // Mock Promos database
  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();

    if (code === 'GIGA200') {
      setAppliedPromo({ code: 'GIGA200', discountVal: 200000, type: 'fixed' });
      setPromoCode('');
    } else if (code === 'WELCOME10') {
      setAppliedPromo({ code: 'WELCOME10', discountVal: 10, type: 'percentage' });
      setPromoCode('');
    } else {
      setPromoError('Mã giảm giá không hợp lệ. Thử GIGA200 hoặc WELCOME10!');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
  };

  const getDiscountAmount = () => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percentage') {
      return subtotal * (appliedPromo.discountVal / 100);
    }
    return appliedPromo.discountVal;
  };

  const discount = getDiscountAmount();
  // Free shipping on order over 10M VND, else 35.000 VND
  const shippingFee = subtotal > 10000000 || subtotal === 0 ? 0 : 35000;
  const grandTotal = Math.max(0, subtotal - discount + shippingFee);

  const handleCheckoutRedirect = () => {
    // Navigate with total calculations state
    navigate('/checkout', { 
      state: { 
        subtotal, 
        discount, 
        shippingFee, 
        grandTotal,
        promoCode: appliedPromo?.code || ''
      } 
    });
  };

  if (cart.length === 0) {
    return (
      <div className="container cart-empty-container text-center">
        <ShoppingBag size={64} className="empty-cart-icon" />
        <h2>Giỏ hàng của bạn trống</h2>
        <p>Không có sản phẩm nào trong giỏ hàng. Hãy lấp đầy nó bằng những chiếc điện thoại mơ ước!</p>
        <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
      </div>
    );
  }

  return (
    <div className="cart-page container">
      <h1 className="page-title">Giỏ Hàng Của Bạn</h1>
      
      <div className="cart-layout">
        {/* Cart items list */}
        <div className="cart-items-panel">
          <div className="items-list-header glass-panel">
            <span>Sản phẩm ({cart.length})</span>
            <button onClick={clearCart} className="btn-clear-cart">Xóa tất cả</button>
          </div>

          <div className="cart-items-list">
            {cart.map((item, index) => {
              const discountMultiplier = 1 - item.phone.discount / 100;
              const unitPrice = (item.phone.basePrice + item.selectedStorage.priceOffset) * discountMultiplier;
              const itemTotal = unitPrice * item.quantity;

              return (
                <div key={`${item.phone.id}-${item.selectedColor.name}-${item.selectedStorage.size}`} className="cart-item-row glass-panel">
                  <div className="item-thumbnail">
                    <img src={item.selectedColor.image} alt={item.phone.name} />
                  </div>
                  
                  <div className="item-details">
                    <Link to={`/product/${item.phone.id}`} className="item-name">
                      {item.phone.name}
                    </Link>
                    <div className="item-variants">
                      <span className="variant-badge">
                        Màu: <strong>{item.selectedColor.name}</strong>
                      </span>
                      <span className="variant-badge">
                        Bộ nhớ: <strong>{item.selectedStorage.size}</strong>
                      </span>
                    </div>
                    <span className="item-unit-price">Đơn giá: {formatPrice(unitPrice)}</span>
                  </div>

                  <div className="item-actions">
                    {/* Quantity counter */}
                    <div className="quantity-counter">
                      <button 
                        onClick={() => updateQuantity(index, item.quantity - 1)} 
                        className="counter-btn"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="counter-val">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(index, item.quantity + 1)} 
                        className="counter-btn"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <span className="item-total-price">{formatPrice(itemTotal)}</span>

                    <button 
                      onClick={() => removeFromCart(index)} 
                      className="btn-delete-item"
                      title="Xóa khỏi giỏ hàng"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <Link to="/products" className="btn-back-to-shop">
            <ArrowLeft size={16} />
            <span>Tiếp tục mua sắm</span>
          </Link>
        </div>

        {/* Cart summary column */}
        <div className="cart-summary-panel">
          {/* Promo code block */}
          <div className="summary-block promo-block glass-panel">
            <h3 className="block-title"><Ticket size={16} /> Mã giảm giá</h3>
            {appliedPromo ? (
              <div className="applied-promo-info">
                <div className="promo-status">
                  <Check size={16} className="text-success" />
                  <span>Đã áp dụng mã: <strong>{appliedPromo.code}</strong></span>
                </div>
                <button onClick={handleRemovePromo} className="btn-remove-promo">Xóa mã</button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="promo-form">
                <input
                  type="text"
                  placeholder="Nhập WELCOME10 hoặc GIGA200"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="form-input promo-input"
                />
                <button type="submit" className="btn btn-secondary">Áp dụng</button>
              </form>
            )}
            {promoError && <p className="promo-error-msg">{promoError}</p>}
            <p className="promo-hint">Gợi ý: <strong>WELCOME10</strong> (Giảm 10%), <strong>GIGA200</strong> (Giảm 200k)</p>
          </div>

          {/* Checkout invoice block */}
          <div className="summary-block invoice-block glass-panel">
            <h3 className="block-title">Chi tiết thanh toán</h3>
            <div className="invoice-row">
              <span>Tạm tính:</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="invoice-row text-success">
                <span>Giảm giá:</span>
                <span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="invoice-row">
              <span>Phí vận chuyển:</span>
              <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
            </div>
            <div className="invoice-divider"></div>
            <div className="invoice-row invoice-grand-total">
              <span>Tổng thanh toán:</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>

            <button onClick={handleCheckoutRedirect} className="btn btn-primary btn-lg w-full checkout-btn">
              Tiến hành thanh toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
