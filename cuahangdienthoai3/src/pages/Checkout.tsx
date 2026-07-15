import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/phones';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  ArrowLeft, 
  CheckCircle,
  QrCode,
  DollarSign
} from 'lucide-react';
import './Checkout.css';

export const Checkout: React.FC = () => {
  const location = useLocation();
  const { cart, clearCart, user, recordUserPurchase } = useApp();

  // Get pricing state from Cart or fallback
  const state = location.state || {};
  const subtotal = state.subtotal || 0;
  const discount = state.discount || 0;
  const shippingFee = state.shippingFee || 0;
  const grandTotal = state.grandTotal || 0;
  const promoCode = state.promoCode || '';

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Hà Nội',
    district: '',
    address: '',
    notes: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'transfer' | 'installment'>('cod');
  const [installmentTerm, setInstallmentTerm] = useState<number>(3); // 3, 6, 12 months
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.district || !formData.address) {
      alert('Vui lòng điền đầy đủ thông tin giao hàng bắt buộc!');
      return;
    }

    setIsSubmitting(true);

    const purchasedIds = cart.map(item => item.phone.id);
    const cleanAddress = `${formData.address}, ${formData.district}, ${formData.city}`;

    const orderPayload = {
      username: user ? user.username : null,
      customerName: formData.name,
      customerPhone: formData.phone,
      customerEmail: formData.email,
      deliveryAddress: cleanAddress,
      notes: formData.notes,
      paymentMethod: paymentMethod,
      grandTotal: grandTotal,
      items: cart.map(item => ({
        phoneId: item.phone.id,
        phoneName: item.phone.name,
        colorName: item.selectedColor.name,
        colorHex: item.selectedColor.hex,
        storageSize: item.selectedStorage.size,
        quantity: item.quantity,
        price: (item.phone.basePrice + item.selectedStorage.priceOffset) * (1 - item.phone.discount / 100)
      }))
    };

    let generatedOrderId = 'ALO-' + Math.floor(100000 + Math.random() * 900000);

    try {
      // 1. Submit order to database
      const orderResponse = await fetch('http://localhost:8080/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderPayload)
      });
      if (orderResponse.ok) {
        const savedOrder = await orderResponse.json();
        generatedOrderId = savedOrder.id;
      }
    } catch (err) {
      console.log('Failed to save order in backend database.', err);
    }

    try {
      // 2. Sync profile purchase history
      if (user) {
        await fetch(`http://localhost:8080/api/auth/profile/${user.username}/purchase`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(purchasedIds),
        });
        recordUserPurchase(purchasedIds);
      } else {
        const guestHistoryStr = localStorage.getItem('guest_purchases');
        const guestHistory = guestHistoryStr ? JSON.parse(guestHistoryStr) : [];
        localStorage.setItem('guest_purchases', JSON.stringify([...guestHistory, ...purchasedIds]));
      }
    } catch (err) {
      console.log('Failed to record purchase on user profile.', err);
      if (user) {
        recordUserPurchase(purchasedIds);
      }
    }

    setIsSubmitting(false);
    setOrderSuccess(true);
    setOrderId(generatedOrderId);
    clearCart();
  };

  // Calculate monthly installments
  const calculateInstallmentPrice = () => {
    const interest = paymentMethod === 'installment' ? 0.05 : 0; // 5% fee
    const totalAmount = grandTotal * (1 + interest);
    return Math.round(totalAmount / installmentTerm);
  };

  if (cart.length === 0 && !orderSuccess) {
    return (
      <div className="container checkout-empty text-center">
        <h2>Không có đơn hàng để thanh toán</h2>
        <p>Vui lòng chọn mua sản phẩm trước khi thanh toán.</p>
        <Link to="/products" className="btn btn-primary">Mua sắm ngay</Link>
      </div>
    );
  }

  // Order Success Screen
  if (orderSuccess) {
    return (
      <div className="container checkout-success text-center">
        <div className="success-icon-wrapper">
          <CheckCircle size={80} className="success-icon text-success" />
        </div>
        <h1 className="success-title">Đặt hàng thành công!</h1>
        <p className="success-subtitle">Cảm ơn bạn đã lựa chọn AloPhone.</p>
        
        <div className="order-details-card glass-panel">
          <div className="order-detail-row">
            <span>Mã đơn hàng:</span>
            <strong>{orderId}</strong>
          </div>
          <div className="order-detail-row">
            <span>Người nhận:</span>
            <strong>{formData.name}</strong>
          </div>
          <div className="order-detail-row">
            <span>Số điện thoại:</span>
            <strong>{formData.phone}</strong>
          </div>
          <div className="order-detail-row">
            <span>Địa chỉ giao hàng:</span>
            <strong>{formData.address}, {formData.district}, {formData.city}</strong>
          </div>
          <div className="order-detail-row">
            <span>Phương thức thanh toán:</span>
            <strong>
              {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
              {paymentMethod === 'transfer' && 'Chuyển khoản ngân hàng'}
              {paymentMethod === 'installment' && `Trả góp ${installmentTerm} tháng`}
            </strong>
          </div>
          <div className="order-detail-row invoice-grand-total">
            <span>Tổng số tiền:</span>
            <span className="price-sale">{formatPrice(grandTotal)}</span>
          </div>
        </div>

        <p className="success-hint">Nhân viên sẽ liên hệ xác nhận đơn hàng với bạn trong 15 phút tới.</p>
        <Link to="/" className="btn btn-primary">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="checkout-page container">
      <div className="checkout-header">
        <Link to="/cart" className="btn-back">
          <ArrowLeft size={16} /> Quay lại giỏ hàng
        </Link>
        <h1 className="page-title">Thanh Toán Đơn Hàng</h1>
      </div>

      {isSubmitting ? (
        <div className="checkout-loading text-center">
          <div className="loading-spinner"></div>
          <h2>Đang xử lý đơn hàng...</h2>
          <p>Hệ thống đang tạo hóa đơn và xác thực thông tin giao dịch.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="checkout-layout">
          {/* Left Column: Form Details & Payment */}
          <div className="checkout-details-column">
            {/* Customer Shipping details */}
            <div className="checkout-card glass-panel">
              <h3 className="card-heading"><MapPin size={18} /> Thông tin giao hàng</h3>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Họ và tên *</label>
                  <div className="input-wrapper">
                    <User size={16} className="input-icon" />
                    <input
                      type="text"
                      name="name"
                      placeholder="Nguyễn Văn A"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input with-icon"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Số điện thoại *</label>
                  <div className="input-wrapper">
                    <Phone size={16} className="input-icon" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="09xxxxxxxx"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input with-icon"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Địa chỉ Email</label>
                  <div className="input-wrapper">
                    <Mail size={16} className="input-icon" />
                    <input
                      type="email"
                      name="email"
                      placeholder="example@mail.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input with-icon"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Tỉnh/Thành phố *</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} className="form-input">
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP Hồ Chí Minh">TP Hồ Chí Minh</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Quận/Huyện *</label>
                  <input
                    type="text"
                    name="district"
                    placeholder="Quận Cầu Giấy"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Địa chỉ nhận hàng chi tiết *</label>
                  <input
                    type="text"
                    name="address"
                    placeholder="Số nhà xx, Ngõ xx, Đường Cầu Giấy"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Ghi chú đơn hàng (nếu có)</label>
                  <textarea
                    name="notes"
                    placeholder="Ghi chú về thời gian giao hàng, hướng dẫn tìm nhà..."
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="form-input text-area"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="checkout-card glass-panel">
              <h3 className="card-heading"><CreditCard size={18} /> Phương thức thanh toán</h3>
              
              <div className="payment-options">
                {/* Option 1: COD */}
                <label className={`payment-option-card glass-panel ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="radio-dot"></div>
                  <div className="payment-option-desc">
                    <div className="option-title-row">
                      <DollarSign size={16} className="text-success" />
                      <strong>Thanh toán khi nhận hàng (COD)</strong>
                    </div>
                    <p>Nhận máy và kiểm tra trước khi giao tiền cho shipper.</p>
                  </div>
                </label>

                {/* Option 2: Transfer */}
                <label className={`payment-option-card glass-panel ${paymentMethod === 'transfer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'transfer'}
                    onChange={() => setPaymentMethod('transfer')}
                  />
                  <div className="radio-dot"></div>
                  <div className="payment-option-desc">
                    <div className="option-title-row">
                      <QrCode size={16} className="text-primary" />
                      <strong>Chuyển khoản Ngân hàng (QR Code)</strong>
                    </div>
                    <p>Hiển thị thông tin chuyển khoản ngân hàng ngay khi đặt hàng.</p>
                  </div>
                </label>

                {/* Option 3: Installment */}
                <label className={`payment-option-card glass-panel ${paymentMethod === 'installment' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'installment'}
                    onChange={() => setPaymentMethod('installment')}
                  />
                  <div className="radio-dot"></div>
                  <div className="payment-option-desc">
                    <div className="option-title-row">
                      <CreditCard size={16} className="text-secondary" />
                      <strong>Trả góp 0% lãi suất qua thẻ</strong>
                    </div>
                    <p>Hỗ trợ chia kỳ hạn 3, 6, hoặc 12 tháng tiện lợi.</p>
                  </div>
                </label>
              </div>

              {/* Bank details conditional display */}
              {paymentMethod === 'transfer' && (
                <div className="payment-details-info glass-panel">
                  <h4>Thông tin tài khoản:</h4>
                  <ul>
                    <li>Ngân hàng: <strong>VPBank (Ngân hàng Việt Nam Thịnh Vượng)</strong></li>
                    <li>Chủ tài khoản: <strong>CONG TY ALOPHONE VN</strong></li>
                    <li>Số tài khoản: <strong>999988886666</strong></li>
                    <li>Nội dung chuyển khoản: <strong>[Họ tên] [Số điện thoại]</strong></li>
                  </ul>
                  <p className="hint">Hệ thống sẽ quét mã QR tự động sau khi bấm Xác nhận đặt hàng.</p>
                </div>
              )}

              {/* Installment details conditional display */}
              {paymentMethod === 'installment' && (
                <div className="payment-details-info glass-panel">
                  <h4>Chọn kỳ hạn trả góp:</h4>
                  <div className="installment-terms-row">
                    {[3, 6, 12].map(term => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setInstallmentTerm(term)}
                        className={`term-btn glass-panel ${installmentTerm === term ? 'active' : ''}`}
                      >
                        <strong>{term} Tháng</strong>
                        <span>Chênh lệch: 0%</span>
                      </button>
                    ))}
                  </div>
                  <div className="installment-calculation">
                    <span>Số tiền cần trả mỗi tháng:</span>
                    <strong className="text-primary">{formatPrice(calculateInstallmentPrice())} / tháng</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Invoice Summary */}
          <div className="checkout-summary-column">
            <div className="checkout-card glass-panel invoice-block">
              <h3 className="card-heading">Hóa đơn mua hàng</h3>
              
              <div className="checkout-invoice-items">
                {cart.map(item => {
                  const unitPrice = item.phone.basePrice + item.selectedStorage.priceOffset;
                  const itemPrice = unitPrice * (1 - item.phone.discount / 100);
                  
                  return (
                    <div key={`${item.phone.id}-${item.selectedColor.name}`} className="invoice-item-row">
                      <div className="invoice-item-desc">
                        <strong>{item.phone.name}</strong>
                        <span>Màu: {item.selectedColor.name} | ROM: {item.selectedStorage.size} | SL: {item.quantity}</span>
                      </div>
                      <span className="invoice-item-price">{formatPrice(itemPrice * item.quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="invoice-divider"></div>

              <div className="invoice-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="invoice-row text-success">
                  <span>Khuyến mãi {promoCode && `(${promoCode})`}:</span>
                  <span>-{formatPrice(discount)}</span>
                </div>
              )}
              <div className="invoice-row">
                <span>Phí vận chuyển:</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              
              <div className="invoice-divider"></div>
              
              <div className="invoice-row invoice-grand-total">
                <span>Tổng số tiền:</span>
                <span className="price-sale">{formatPrice(grandTotal)}</span>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-full submit-order-btn">
                Xác nhận đặt hàng
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
