import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/phones';
import { 
  User, 
  Mail, 
  Phone as PhoneIcon, 
  MapPin, 
  ShoppingBag, 
  Edit2, 
  Check, 
  X, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Clock,
  Truck,
  Package,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import './Profile.css';

interface OrderItem {
  phoneId: string;
  phoneName: string;
  colorName: string;
  colorHex: string;
  storageSize: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  username: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  notes: string;
  paymentMethod: string;
  status: string;
  orderDate: string;
  grandTotal: number;
  items: OrderItem[];
}

export const Profile: React.FC = () => {
  const { user, updateUserProfile, products } = useApp();
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // If not logged in, redirect to login
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [activeTab, setActiveTab] = useState<'orders' | 'purchases'>('orders');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    avatar: user?.avatar || ''
  });

  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Orders State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  // Sync state if user context changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  // Fetch orders from backend
  useEffect(() => {
    if (!user) return;
    const fetchOrders = async () => {
      try {
        const response = await fetch(`http://localhost:8080/api/orders/user/${user.username}`);
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to fetch user orders:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) return null;

  // Resolve purchased items
  const purchaseIds = user.purchasedPhoneIds || [];
  const purchasedProducts = products.filter(phone => purchaseIds.includes(phone.id));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess(false);
    setLoading(true);

    try {
      const response = await fetch(`http://localhost:8080/api/auth/profile/${user.username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          avatar: formData.avatar
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Sync context
        updateUserProfile({
          fullName: updatedUser.fullName,
          email: updatedUser.email,
          phone: updatedUser.phone,
          address: updatedUser.address,
          avatar: updatedUser.avatar
        });
        setSaveSuccess(true);
        setIsEditing(false);
      } else {
        setSaveError('Không thể cập nhật hồ sơ cá nhân!');
      }
    } catch (err) {
      console.log('Backend offline, simulating local profile update.', err);
      // Fallback update local state only
      updateUserProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        avatar: formData.avatar
      });
      setSaveSuccess(true);
      setIsEditing(false);
    } finally {
      setLoading(false);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user.fullName,
      email: user.email || '',
      phone: user.phone || '',
      address: user.address || '',
      avatar: user.avatar || ''
    });
    setIsEditing(false);
    setSaveError('');
  };

  const handleAvatarClick = () => {
    if (isEditing) {
      avatarInputRef.current?.click();
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh hợp lệ (png, jpg, jpeg, webp...)!');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        alert('Kích thước ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOrderExpand = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { label: 'Đang xử lý', color: 'status-pending', step: 1 };
      case 'CONFIRMED':
        return { label: 'Đã xác nhận', color: 'status-confirmed', step: 2 };
      case 'SHIPPING':
        return { label: 'Đang vận chuyển', color: 'status-shipping', step: 3 };
      case 'DELIVERED':
        return { label: 'Đã giao hàng', color: 'status-delivered', step: 4 };
      case 'CANCELLED':
        return { label: 'Đã hủy', color: 'status-cancelled', step: 0 };
      default:
        return { label: status, color: 'status-unknown', step: 0 };
    }
  };

  const renderCancelledTimeline = () => {
    return (
      <div className="order-timeline cancelled">
        <div className="timeline-step active cancelled">
          <div className="step-icon-wrapper">
            <AlertCircle size={16} />
          </div>
          <span className="step-label">Đơn hàng đã hủy</span>
        </div>
      </div>
    );
  };

  const renderOrderTimeline = (currentStep: number) => {
    const steps = [
      { id: 1, label: 'Đang xử lý', icon: <Clock size={16} /> },
      { id: 2, label: 'Đã xác nhận', icon: <Check size={16} /> },
      { id: 3, label: 'Đang vận chuyển', icon: <Truck size={16} /> },
      { id: 4, label: 'Đã giao hàng', icon: <Package size={16} /> }
    ];

    return (
      <div className="order-timeline-wrapper">
        <div className="order-timeline-bar">
          <div 
            className="order-timeline-progress" 
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
        </div>
        <div className="order-timeline-steps">
          {steps.map((step) => {
            const isActive = step.id <= currentStep;
            const isCurrent = step.id === currentStep;
            return (
              <div key={step.id} className={`timeline-step ${isActive ? 'active' : ''} ${isCurrent ? 'current' : ''}`}>
                <div className="step-icon-wrapper">
                  {step.icon}
                </div>
                <span className="step-label">{step.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="profile-page container">
      <h1 className="profile-page-title page-title">Hồ Sơ Cá Nhân</h1>
      
      <div className="profile-layout">
        {/* Left Column: Avatar & Summary */}
        <div className="profile-summary-card glass-panel text-center">
          <div 
            className={`profile-avatar-container ${isEditing ? 'editable' : ''}`}
            onClick={handleAvatarClick}
            title={isEditing ? 'Click để tải lên ảnh đại diện mới' : undefined}
          >
            {formData.avatar ? (
              <img src={formData.avatar} alt={user.fullName} className="profile-avatar-large" />
            ) : (
              <div className="profile-avatar-placeholder-large">{formData.fullName.charAt(0).toUpperCase()}</div>
            )}
            {isEditing && (
              <div className="avatar-edit-overlay">
                <Edit2 size={16} />
                <span>Tải ảnh</span>
              </div>
            )}
            <input 
              type="file"
              ref={avatarInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </div>
          
          <h2 className="profile-fullname">{formData.fullName}</h2>
          <span className="profile-role-badge">{user.role === 'ADMIN' ? 'Quản Trị Viên' : 'Thành Viên'}</span>
          <p className="profile-username-hint">Tên đăng nhập: @{user.username}</p>

          {saveSuccess && (
            <div className="profile-alert text-success">
              <Check size={16} /> Cập nhật thành công!
            </div>
          )}

          {saveError && (
            <div className="profile-alert text-danger">
              <X size={16} /> {saveError}
            </div>
          )}
        </div>

        {/* Right Column: Profile details & Tabbed History */}
        <div className="profile-details-column">
          {/* General Information Card */}
          <div className="profile-card glass-panel">
            <div className="profile-card-header">
              <h3>Thông tin cá nhân</h3>
              {!isEditing ? (
                <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-sm edit-btn">
                  <Edit2 size={14} /> Chỉnh sửa
                </button>
              ) : (
                <div className="edit-actions">
                  <button onClick={handleSave} className="btn btn-primary btn-sm save-btn" disabled={loading}>
                    <Check size={14} /> Lưu
                  </button>
                  <button onClick={handleCancel} className="btn btn-secondary btn-sm cancel-btn" disabled={loading}>
                    <X size={14} /> Hủy
                  </button>
                </div>
              )}
            </div>

            <div className="profile-form-grid">
              <div className="profile-form-group">
                <label><User size={14} /> Họ và tên</label>
                {isEditing ? (
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                ) : (
                  <p className="profile-value">{formData.fullName || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label><Mail size={14} /> Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <p className="profile-value">{formData.email || 'Chưa cập nhật'}</p>
                )}
              </div>

              <div className="profile-form-group">
                <label><PhoneIcon size={14} /> Số điện thoại</label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                ) : (
                  <p className="profile-value">{formData.phone || 'Chưa cập nhật'}</p>
                )}
              </div>



              <div className="profile-form-group col-span-2">
                <label><MapPin size={14} /> Địa chỉ giao hàng mặc định</label>
                {isEditing ? (
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input text-area"
                    rows={2}
                  />
                ) : (
                  <p className="profile-value">{formData.address || 'Chưa cập nhật'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content Tabs */}
          <div className="profile-tabs-container">
            <button 
              className={`profile-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ClipboardList size={16} /> Đơn hàng đã đặt
            </button>
            <button 
              className={`profile-tab-btn ${activeTab === 'purchases' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchases')}
            >
              <ShoppingBag size={16} /> Thiết bị đã sở hữu
            </button>
          </div>

          {/* Active Tab Panel */}
          {activeTab === 'orders' ? (
            <div className="profile-card glass-panel order-history-panel">
              <div className="profile-card-header">
                <h3>Lịch sử đơn hàng</h3>
                <span className="purchased-count-badge">{orders.length} đơn hàng</span>
              </div>

              {loadingOrders ? (
                <div className="text-center py-5">
                  <div className="loading-spinner"></div>
                  <p className="mt-2 text-muted">Đang tải lịch sử đơn hàng...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="empty-purchases text-center">
                  <p>Bạn chưa đặt đơn hàng nào.</p>
                  <Link to="/products" className="btn btn-primary btn-sm">Mua sắm ngay</Link>
                </div>
              ) : (
                <div className="order-history-list">
                  {orders.map(order => {
                    const statusInfo = getStatusDetails(order.status);
                    const isExpanded = !!expandedOrders[order.id];
                    return (
                      <div key={order.id} className="order-history-card glass-panel-heavy">
                        <div className="order-card-summary" onClick={() => toggleOrderExpand(order.id)}>
                          <div className="order-summary-left">
                            <div className="order-id-date">
                              <span className="order-id-label">Mã đơn:</span>
                              <span className="order-id">{order.id}</span>
                              <span className="order-date-divider">•</span>
                              <span className="order-date">
                                {new Date(order.orderDate).toLocaleDateString('vi-VN', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="order-payment-method">
                              <span>Thanh toán: </span>
                              <strong className="text-uppercase">
                                {order.paymentMethod === 'cod' && 'COD (Nhận hàng thanh toán)'}
                                {order.paymentMethod === 'transfer' && 'Chuyển khoản NH'}
                                {order.paymentMethod === 'installment' && 'Trả góp'}
                              </strong>
                            </div>
                            <div className="order-items-preview">
                              {order.items.length} sản phẩm: {order.items.map(item => `${item.phoneName} (x${item.quantity})`).join(', ')}
                            </div>
                          </div>
                          <div className="order-summary-right text-right">
                            <div className="order-grand-total">
                              <span className="total-label">Tổng cộng:</span>
                              <span className="total-value text-primary">{formatPrice(order.grandTotal)}</span>
                            </div>
                            <div className="order-status-action">
                              <span className={`status-badge-premium ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                              <button className="btn-expand-order">
                                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Progress Timeline in the Card */}
                        <div className="order-card-timeline-container">
                          {order.status === 'CANCELLED' ? renderCancelledTimeline() : renderOrderTimeline(statusInfo.step)}
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div className="order-expanded-details">
                            <div className="order-details-divider"></div>
                            
                            <div className="order-details-grid">
                              <div className="delivery-info">
                                <h5>Thông tin nhận hàng</h5>
                                <p><strong>Người nhận:</strong> {order.customerName}</p>
                                <p><strong>Điện thoại:</strong> {order.customerPhone}</p>
                                <p><strong>Email:</strong> {order.customerEmail || 'Không cung cấp'}</p>
                                <p><strong>Địa chỉ:</strong> {order.deliveryAddress}</p>
                                {order.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
                              </div>
                              
                              <div className="order-items-list-expanded">
                                <h5>Danh sách sản phẩm</h5>
                                <div className="order-items-container">
                                  {order.items.map((item, idx) => {
                                    const phoneDetail = products.find(p => p.id === item.phoneId);
                                    return (
                                      <div key={idx} className="expanded-item-row" onClick={() => navigate(`/products/${item.phoneId}`)}>
                                        <div className="expanded-item-img">
                                          <img 
                                            src={phoneDetail?.image || 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=100'} 
                                            alt={item.phoneName} 
                                          />
                                        </div>
                                        <div className="expanded-item-info">
                                          <h6>{item.phoneName}</h6>
                                          <span>Màu: {item.colorName} | Dung lượng: {item.storageSize}</span>
                                        </div>
                                        <div className="expanded-item-qty-price text-right">
                                          <span className="qty-tag">SL: {item.quantity}</span>
                                          <span className="item-price-tag">{formatPrice(item.price)}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="profile-card glass-panel purchased-history-card">
              <div className="profile-card-header">
                <h3>Sản phẩm đã mua</h3>
                <span className="purchased-count-badge">{purchasedProducts.length} sản phẩm</span>
              </div>

              {purchasedProducts.length === 0 ? (
                <div className="empty-purchases text-center">
                  <p>Bạn chưa mua sản phẩm nào.</p>
                  <Link to="/products" className="btn btn-primary btn-sm">Mua sắm ngay</Link>
                </div>
              ) : (
                <div className="purchased-items-grid">
                  {purchasedProducts.map(phone => {
                    const salePrice = phone.basePrice * (1 - phone.discount / 100);
                    return (
                      <div key={phone.id} className="purchased-item-card glass-panel-heavy" onClick={() => navigate(`/products/${phone.id}`)}>
                        <div className="item-img-wrapper">
                          <img src={phone.image} alt={phone.name} />
                        </div>
                        <div className="item-info">
                          <span className="item-brand">{phone.brand}</span>
                          <h4>{phone.name}</h4>
                          <div className="price-tag">
                            <span className="price-label">Giá hiện tại: </span>
                            <span className="price-value text-primary">{formatPrice(salePrice)}</span>
                          </div>
                        </div>
                        <div className="item-action">
                          <ExternalLink size={16} className="text-muted" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
