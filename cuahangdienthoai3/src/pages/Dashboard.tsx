import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../data/phones';
import type { Phone } from '../data/phones';
import { 
  TrendingUp, 
  Layers, 
  Inbox, 
  ShoppingBag,
  Plus, 
  Trash2, 
  Sliders, 
  PlusCircle, 
  Check,
  ShieldAlert
} from 'lucide-react';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const { user, products, setProducts } = useApp();
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<number>(0);

  interface FormColorOption {
    name: string;
    hex: string;
    image: string;
  }

  // Form add product state
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Apple',
    basePrice: '',
    description: '',
    tag: 'New' as Phone['tag'],
    stock: '',
    screen: '6.7 inches, OLED, 120Hz',
    cpu: 'Apple A17 Pro / Snapdragon 8 Gen 3',
    ram: '8 GB',
    rom: '256 GB',
    battery: '5000 mAh',
    camera: 'Chính 48MP / 50MP',
    os: 'iOS / Android',
    weight: '210 g'
  });

  const [colors, setColors] = useState<FormColorOption[]>([
    { name: 'Xám Không Gian', hex: '#5c5e61', image: '' }
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  // Live orders state
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState<boolean>(true);

  // Reviews integration states
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState<boolean>(true);
  const [filterPhoneId, setFilterPhoneId] = useState<string>('all');

  const fetchAllReviews = async () => {
    setLoadingReviews(true);
    try {
      const response = await fetch('http://localhost:8080/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Failed to load reviews in admin:', err);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    fetchAllReviews();
  }, []);

  const handleDeleteReview = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này khỏi hệ thống?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/reviews/${id}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setReviews(prev => prev.filter(r => r.id !== id));
          triggerNotification('Đã xóa đánh giá thành công!');
          // Refresh products to update ratings in context
          const prodResponse = await fetch('http://localhost:8080/api/phones');
          if (prodResponse.ok) {
            const prodData = await prodResponse.json();
            setProducts(prodData);
          }
        } else {
          alert('Lỗi: Không thể xóa đánh giá!');
        }
      } catch (err) {
        console.error('Failed to delete review:', err);
        alert('Lỗi kết nối khi xóa đánh giá!');
      }
    }
  };

  // Fetch orders from backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/orders');
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (err) {
        console.error('Failed to load orders from backend:', err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:8080/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newStatus)
      });
      if (response.ok) {
        const updatedOrder = await response.json();
        setOrders(prev => prev.map(o => o.id === id ? updatedOrder : o));
        
        const statusMap: Record<string, string> = {
          PENDING: 'Chờ xử lý',
          CONFIRMED: 'Đã xác nhận',
          SHIPPING: 'Đang vận chuyển',
          DELIVERED: 'Đã giao hàng',
          CANCELLED: 'Đã hủy'
        };
        triggerNotification(`Đã cập nhật trạng thái đơn hàng sang ${statusMap[newStatus] || newStatus}!`);
      } else {
        alert('Không thể cập nhật trạng thái đơn hàng!');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      alert('Lỗi kết nối khi cập nhật đơn hàng!');
    }
  };

  // Guard check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="container not-found-container text-center" style={{ padding: '100px 20px' }}>
        <div style={{ display: 'inline-flex', padding: '16px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger-color)', borderRadius: '50%', marginBottom: '20px' }}>
          <ShieldAlert size={48} />
        </div>
        <h2>Truy cập bị từ chối</h2>
        <p>Trang này chỉ dành cho tài khoản Quản trị viên (Admin).</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '20px' }}>
          <Link to="/login" className="btn btn-primary">Đăng nhập Admin</Link>
          <Link to="/" className="btn btn-secondary">Quay lại Trang chủ</Link>
        </div>
      </div>
    );
  }

  // Analytical indicators
  const totalProducts = products.length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);
  const estimatedRevenue = orders
    .filter(o => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + o.grandTotal, 0);
  const activeOrdersCount = orders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED' || o.status === 'SHIPPING').length;

  // Revenue chart data (Pure CSS bar height percentage)
  const monthlyRevenue = [
    { month: 'T1', val: 120000000 },
    { month: 'T2', val: 180000000 },
    { month: 'T3', val: 240000000 },
    { month: 'T4', val: 190000000 },
    { month: 'T5', val: 310000000 },
    { month: 'T6', val: 450000000 }
  ];
  const maxRevenueVal = Math.max(...monthlyRevenue.map(m => m.val));

  // Handler for adding a color slot
  const handleAddColorRow = () => {
    setColors(prev => [...prev, { name: '', hex: '#000000', image: '' }]);
  };

  // Handler for removing a color slot
  const handleRemoveColorRow = (index: number) => {
    if (colors.length === 1) {
      alert('Sản phẩm cần có ít nhất 1 cấu hình màu sắc!');
      return;
    }
    setColors(prev => prev.filter((_, i) => i !== index));
  };

  // Handler for updating field values in a specific color slot
  const handleColorFieldChange = (index: number, field: keyof FormColorOption, value: string) => {
    setColors(prev => prev.map((c, i) => i === index ? { ...c, [field]: value } : c));
  };

  // Handler for loading a local image in a specific color slot and converting to Base64
  const handleColorImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
        setColors(prev => prev.map((c, i) => i === index ? { ...c, image: reader.result as string } : c));
      };
      reader.readAsDataURL(file);
    }
  };

  // Form handle submit (Post to REST API)
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.basePrice || !formData.stock) {
      alert('Vui lòng điền các trường bắt buộc!');
      return;
    }

    // Validate that all color configurations are complete
    const incompleteColor = colors.find(c => !c.name.trim() || !c.image);
    if (incompleteColor) {
      alert('Vui lòng nhập đầy đủ tên màu sắc và tải ảnh lên cho tất cả các cấu hình màu!');
      return;
    }

    const mainImage = colors[0].image;
    const allImages = colors.map(c => c.image).filter(Boolean);

    const newId = formData.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    const newPhone: Phone = {
      id: newId,
      name: formData.name,
      brand: formData.brand,
      basePrice: Number(formData.basePrice),
      rating: 4.8, // default mock rating
      reviewsCount: 1,
      image: mainImage,
      images: allImages,
      colors: colors.map(c => ({
        name: c.name,
        hex: c.hex,
        image: c.image
      })),
      storage: [
        { size: formData.rom, priceOffset: 0 }
      ],
      specs: {
        screen: formData.screen,
        cpu: formData.cpu,
        ram: formData.ram,
        rom: formData.rom,
        battery: formData.battery,
        camera: formData.camera,
        os: formData.os,
        weight: formData.weight
      },
      description: formData.description || 'Chưa có mô tả chi tiết cho sản phẩm này.',
      tag: formData.tag,
      discount: 0,
      stock: Number(formData.stock)
    };

    try {
      const response = await fetch('http://localhost:8080/api/phones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPhone)
      });
      if (response.ok) {
        const savedPhone = await response.json();
        setProducts(prev => [savedPhone, ...prev]);
        triggerNotification('Thêm sản phẩm thành công!');
      } else {
        alert('Lỗi: Không thể lưu sản phẩm vào cơ sở dữ liệu!');
        // Fallback local update
        setProducts(prev => [newPhone, ...prev]);
        triggerNotification('Thêm sản phẩm thành công (offline)!');
      }
    } catch (err) {
      console.error('Failed to add product to backend:', err);
      // Fallback local update
      setProducts(prev => [newPhone, ...prev]);
      triggerNotification('Thêm sản phẩm thành công (offline)!');
    }

    // Reset Form fields
    setFormData({
      name: '',
      brand: 'Apple',
      basePrice: '',
      description: '',
      tag: 'New',
      stock: '',
      screen: '6.7 inches, OLED, 120Hz',
      cpu: 'Apple A17 Pro / Snapdragon 8 Gen 3',
      ram: '8 GB',
      rom: '256 GB',
      battery: '5000 mAh',
      camera: 'Chính 48MP / 50MP',
      os: 'iOS / Android',
      weight: '210 g'
    });

    setColors([
      { name: 'Xám Không Gian', hex: '#5c5e61', image: '' }
    ]);

    const fileInputs = document.querySelectorAll('.color-file-input') as NodeListOf<HTMLInputElement>;
    fileInputs.forEach(input => {
      input.value = '';
    });
  };

  // Stock edit functionality
  const handleStartEditStock = (id: string, curStock: number) => {
    setEditingStockId(id);
    setTempStockValue(curStock);
  };

  const handleSaveStock = async (id: string) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;
    const updatedProduct = { ...targetProduct, stock: tempStockValue };

    try {
      const response = await fetch(`http://localhost:8080/api/phones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });
      if (response.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: tempStockValue } : p));
        triggerNotification('Cập nhật số lượng kho thành công!');
      } else {
        alert('Lỗi: Không thể lưu số lượng kho vào database!');
      }
    } catch (err) {
      console.error('Failed to update stock in backend:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, stock: tempStockValue } : p));
      triggerNotification('Cập nhật số lượng kho thành công (offline)!');
    }
    setEditingStockId(null);
  };

  // Delete product functionality
  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này khỏi hệ thống?')) {
      try {
        const response = await fetch(`http://localhost:8080/api/phones/${id}`, {
          method: 'DELETE'
        });
        if (response.status === 204 || response.ok) {
          setProducts(prev => prev.filter(p => p.id !== id));
          triggerNotification('Đã xóa sản phẩm!');
        } else {
          alert('Lỗi: Không thể xóa sản phẩm khỏi database!');
        }
      } catch (err) {
        console.error('Failed to delete product from backend:', err);
        setProducts(prev => prev.filter(p => p.id !== id));
        triggerNotification('Đã xóa sản phẩm (offline)!');
      }
    }
  };
  // Update product tag functionality
  const handleUpdatePhoneTag = async (id: string, newTag: string) => {
    const targetProduct = products.find(p => p.id === id);
    if (!targetProduct) return;
    const updatedProduct = { ...targetProduct, tag: newTag as Phone['tag'] };

    try {
      const response = await fetch(`http://localhost:8080/api/phones/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProduct)
      });
      if (response.ok) {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, tag: newTag as Phone['tag'] } : p));
        triggerNotification('Cập nhật nhãn sản phẩm thành công!');
      } else {
        alert('Lỗi: Không thể cập nhật nhãn sản phẩm vào database!');
      }
    } catch (err) {
      console.error('Failed to update product tag in backend:', err);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, tag: newTag as Phone['tag'] } : p));
      triggerNotification('Cập nhật nhãn sản phẩm thành công (offline)!');
    }
  };
  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="dashboard-page container">
      {/* Dynamic alert indicator */}
      {notification && (
        <div className="dashboard-alert glass-panel-heavy">
          <Check size={16} className="text-success" />
          <span>{notification}</span>
        </div>
      )}

      <div className="dashboard-header-row">
        <div>
          <h1 className="page-title">Quản Trị Hệ Thống</h1>
          <p className="search-result-desc">Theo dõi doanh thu, điều chỉnh kho hàng và đăng tải sản phẩm mới.</p>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="analytics-grid">
        <div className="analytics-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper text-success">
              <TrendingUp size={20} />
            </div>
            <span className="card-lbl">Ước tính doanh số</span>
          </div>
          <strong className="card-val">{formatPrice(estimatedRevenue)}</strong>
          <span className="card-trend text-success">+12.4% so với tháng trước</span>
        </div>

        <div className="analytics-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper text-primary">
              <Layers size={20} />
            </div>
            <span className="card-lbl">Tổng số dòng máy</span>
          </div>
          <strong className="card-val">{totalProducts} sản phẩm</strong>
          <span className="card-trend">Hoạt động trong danh mục</span>
        </div>

        <div className="analytics-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper text-secondary">
              <Inbox size={20} />
            </div>
            <span className="card-lbl">Tồn kho thiết bị</span>
          </div>
          <strong className="card-val">{totalStock} máy</strong>
          <span className="card-trend text-warning">{totalStock < 100 ? 'Cảnh báo: Tồn kho thấp' : 'Mức tồn kho an toàn'}</span>
        </div>

        <div className="analytics-card glass-panel">
          <div className="card-top">
            <div className="icon-wrapper text-warning">
              <ShoppingBag size={20} />
            </div>
            <span className="card-lbl">Đơn hàng chờ xử lý</span>
          </div>
          <strong className="card-val">{activeOrdersCount} đơn</strong>
          <span className="card-trend text-primary">Cập nhật thời gian thực</span>
        </div>
      </div>

      {/* Analytics chart and add form layout */}
      <div className="dashboard-double-panel">
        {/* Left Side: Revenue Chart */}
        <div className="dashboard-card glass-panel chart-card-panel">
          <h3 className="card-heading">Biểu đồ doanh thu (6 tháng gần đây)</h3>
          
          <div className="chart-bar-container">
            <div className="chart-bar-y-axis">
              <span>500M</span>
              <span>250M</span>
              <span>0</span>
            </div>
            
            <div className="chart-bars-group">
              {monthlyRevenue.map((item, idx) => {
                const heightPercent = (item.val / maxRevenueVal) * 100;
                return (
                  <div key={idx} className="chart-bar-col">
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar-fill gradient-bg" 
                        style={{ height: `${heightPercent}%` }}
                        title={formatPrice(item.val)}
                      >
                        <span className="bar-tooltip">{formatPrice(item.val)}</span>
                      </div>
                    </div>
                    <span className="chart-bar-label">{item.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Add new product Form */}
        <div className="dashboard-card glass-panel add-product-card-panel">
          <h3 className="card-heading"><PlusCircle size={18} /> Thêm sản phẩm mới</h3>
          
          <form onSubmit={handleAddProduct} className="add-product-form">
            <div className="form-group-row">
              <div className="form-group">
                <label>Tên điện thoại *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: iPhone 16 Pro Max"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="form-input form-input-sm"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Thương hiệu *</label>
                <select 
                  value={formData.brand} 
                  onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                  className="form-input form-input-sm"
                >
                  <option value="Apple">Apple</option>
                  <option value="Samsung">Samsung</option>
                  <option value="Xiaomi">Xiaomi</option>
                  <option value="OnePlus">OnePlus</option>
                  <option value="Google">Google</option>
                </select>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Giá bán lẻ (VND) *</label>
                <input
                  type="number"
                  placeholder="30000000"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: e.target.value }))}
                  className="form-input form-input-sm"
                  required
                />
              </div>

              <div className="form-group">
                <label>Số lượng kho bán đầu *</label>
                <input
                  type="number"
                  placeholder="10"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="form-input form-input-sm"
                  required
                />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>RAM mặc định</label>
                <input
                  type="text"
                  value={formData.ram}
                  onChange={(e) => setFormData(prev => ({ ...prev, ram: e.target.value }))}
                  className="form-input form-input-sm"
                />
              </div>

              <div className="form-group">
                <label>Bộ nhớ ROM mặc định</label>
                <input
                  type="text"
                  value={formData.rom}
                  onChange={(e) => setFormData(prev => ({ ...prev, rom: e.target.value }))}
                  className="form-input form-input-sm"
                />
              </div>
            </div>

            <div className="form-group color-options-group">
              <label>Cấu hình màu sắc & Ảnh sản phẩm *</label>
              <p className="form-help-text" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
                * Sản phẩm sẽ tự động lấy ảnh của màu sắc đầu tiên làm ảnh hiển thị chính trong danh sách.
              </p>
              
              <div className="colors-list-builder" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {colors.map((color, index) => (
                  <div key={index} className="color-builder-row glass-panel-heavy" style={{ padding: '15px', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="color-row-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(var(--border-rgb), 0.3)', paddingBottom: '8px' }}>
                      <strong style={{ fontSize: '0.85rem' }}>Màu #{index + 1}</strong>
                      {colors.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => handleRemoveColorRow(index)} 
                          className="btn-remove-color" 
                          title="Xóa màu này"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="color-row-inputs" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                      <div className="form-group">
                        <label>Tên màu sắc</label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Titan Tự Nhiên"
                          value={color.name}
                          onChange={(e) => handleColorFieldChange(index, 'name', e.target.value)}
                          className="form-input form-input-sm"
                          required
                        />
                      </div>
                      
                      <div className="form-group color-picker-group">
                        <label>Mã màu Hex</label>
                        <div className="color-picker-input-wrapper" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="color"
                            value={color.hex}
                            onChange={(e) => handleColorFieldChange(index, 'hex', e.target.value)}
                            className="color-picker-native"
                            style={{ width: '36px', height: '36px', padding: '0', border: '1px solid rgba(var(--border-rgb), 0.5)', borderRadius: '4px', cursor: 'pointer', background: 'transparent' }}
                          />
                          <input
                            type="text"
                            value={color.hex}
                            onChange={(e) => handleColorFieldChange(index, 'hex', e.target.value)}
                            className="form-input form-input-sm color-hex-text"
                            style={{ textTransform: 'uppercase' }}
                            maxLength={7}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="form-group color-image-upload-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label>Ảnh cho màu này *</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleColorImageUpload(index, e)}
                        className="form-input form-input-sm file-input color-file-input"
                        required={!color.image}
                      />
                      {color.image && (
                        <div className="upload-preview-wrapper" style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                          <p className="preview-label">Xem trước ảnh màu này:</p>
                          <img src={color.image} alt="Màu sắc xem trước" className="upload-preview" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button" 
                onClick={handleAddColorRow} 
                className="btn btn-secondary btn-sm btn-add-color-slot"
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '12px' }}
              >
                <PlusCircle size={14} /> Thêm cấu hình màu sắc
              </button>
            </div>

            <div className="form-group">
              <label>Mô tả ngắn</label>
              <textarea
                placeholder="Điện thoại sở hữu cấu hình mạnh, pin dung lượng cực lớn..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="form-input form-input-sm dashboard-textarea"
              />
            </div>

            <div className="form-group">
              <label>Nhãn thẻ tag</label>
              <select 
                value={formData.tag} 
                onChange={(e) => setFormData(prev => ({ ...prev, tag: e.target.value as Phone['tag'] }))}
                className="form-input form-input-sm"
              >
                <option value="New">New (Sản phẩm mới)</option>
                <option value="Best Seller">Best Seller (Bán chạy)</option>
                <option value="Hot Deal">Hot Deal (Khuyến mãi lớn)</option>
                <option value="None">None (Không gắn nhãn)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-sm submit-add-btn">
              <Plus size={14} /> Đăng tải sản phẩm
            </button>
          </form>
        </div>
      </div>

      {/* Catalog stock list manager */}
      <div className="dashboard-card glass-panel inventory-table-card">
        <h3 className="card-heading"><Sliders size={18} /> Quản lý kho hàng & Danh mục</h3>
        
        <div className="table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Đơn giá</th>
                <th>Tồn kho</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {products.map(phone => (
                <tr key={phone.id}>
                  <td className="col-img">
                    <img src={phone.image} alt={phone.name} />
                  </td>
                  <td className="col-name">
                    <strong>{phone.name}</strong>
                    <div style={{ marginTop: '6px' }}>
                      <select
                        value={phone.tag}
                        onChange={(e) => handleUpdatePhoneTag(phone.id, e.target.value)}
                        className={`badge badge-sm ${
                          phone.tag === 'New' ? 'badge-new' : 
                          phone.tag === 'Best Seller' ? 'badge-bestseller' : 
                          phone.tag === 'Hot Deal' ? 'badge-hotdeal' : ''
                        }`}
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '8px',
                          border: '1px solid rgba(var(--border-rgb), 0.3)',
                          cursor: 'pointer',
                          background: 'var(--bg-card)',
                          color: 'var(--text-color)',
                          outline: 'none',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <option value="None">None</option>
                        <option value="New">New</option>
                        <option value="Best Seller">Best Seller</option>
                        <option value="Hot Deal">Hot Deal</option>
                      </select>
                    </div>
                  </td>
                  <td>{phone.brand}</td>
                  <td className="col-price">{formatPrice(phone.basePrice)}</td>
                  <td className="col-stock">
                    {editingStockId === phone.id ? (
                      <div className="edit-stock-wrapper">
                        <input
                          type="number"
                          value={tempStockValue}
                          onChange={(e) => setTempStockValue(Number(e.target.value))}
                          className="form-input stock-edit-input"
                          min={0}
                        />
                        <button onClick={() => handleSaveStock(phone.id)} className="btn-save-stock" title="Lưu">
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <div onClick={() => handleStartEditStock(phone.id, phone.stock)} className="stock-display-val" title="Click để chỉnh sửa">
                        <span className={`stock-dot ${phone.stock < 10 ? 'red' : 'green'}`}></span>
                        <span>{phone.stock} máy</span>
                      </div>
                    )}
                  </td>
                  <td className="col-actions">
                    <button onClick={() => handleDeleteProduct(phone.id)} className="btn-delete-product" title="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dynamic Orders Manager Section */}
      <div className="dashboard-card glass-panel inventory-table-card" style={{ marginTop: '30px' }}>
        <h3 className="card-heading"><ShoppingBag size={18} /> Quản lý đơn hàng đặt mua</h3>
        
        {loadingOrders ? (
          <div className="text-center" style={{ padding: '20px' }}>Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="text-center" style={{ padding: '20px', color: 'var(--text-muted)' }}>Chưa có đơn hàng nào trong hệ thống.</div>
        ) : (
          <div className="table-wrapper">
            <table className="inventory-table">
              <thead>
                <tr>
                  <th>Mã Đơn Hàng</th>
                  <th>Khách Hàng</th>
                  <th>Địa Chỉ Giao Hàng</th>
                  <th>Tổng Giá Trị</th>
                  <th>Phương Thức</th>
                  <th>Trạng Trí</th>
                  <th>Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                    </td>
                    <td>
                      <div><strong>{order.customerName}</strong></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SĐT: {order.customerPhone}</div>
                      {order.customerEmail && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.customerEmail}</div>}
                    </td>
                    <td>
                      <div style={{ maxWidth: '280px', fontSize: '0.8rem', whiteSpace: 'normal', wordBreak: 'break-word' }}>
                        {order.deliveryAddress}
                      </div>
                      {order.notes && <div style={{ fontSize: '0.75rem', color: 'var(--danger-color)', fontStyle: 'italic' }}>Ghi chú: {order.notes}</div>}
                    </td>
                    <td className="col-price">{formatPrice(order.grandTotal)}</td>
                    <td style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>{order.paymentMethod}</td>
                    <td>
                      <span className={`badge badge-sm`}
                      style={{
                        backgroundColor: 
                          order.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' :
                          order.status === 'CONFIRMED' ? 'rgba(59, 130, 246, 0.15)' :
                          order.status === 'SHIPPING' ? 'rgba(139, 92, 246, 0.15)' :
                          order.status === 'DELIVERED' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color:
                          order.status === 'PENDING' ? '#f59e0b' :
                          order.status === 'CONFIRMED' ? '#3b82f6' :
                          order.status === 'SHIPPING' ? '#8b5cf6' :
                          order.status === 'DELIVERED' ? '#10b981' : '#ef4444',
                        border: '1px solid transparent'
                      }}>
                        {order.status === 'PENDING' && 'Chờ xử lý'}
                        {order.status === 'CONFIRMED' && 'Đã xác nhận'}
                        {order.status === 'SHIPPING' && 'Đang vận chuyển'}
                        {order.status === 'DELIVERED' && 'Đã giao'}
                        {order.status === 'CANCELLED' && 'Đã hủy'}
                      </span>
                    </td>
                    <td>
                      {order.status === 'PENDING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'CONFIRMED')} 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          >
                            Xác nhận
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')} 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger-color)' }}
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      {order.status === 'CONFIRMED' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'SHIPPING')} 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#8b5cf6', borderColor: '#8b5cf6' }}
                          >
                            Giao hàng
                          </button>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'CANCELLED')} 
                            className="btn btn-secondary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', color: 'var(--danger-color)' }}
                          >
                            Hủy
                          </button>
                        </div>
                      )}
                      {order.status === 'SHIPPING' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')} 
                            className="btn btn-primary btn-sm" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', backgroundColor: '#10b981', borderColor: '#10b981' }}
                          >
                            Hoàn thành
                          </button>
                        </div>
                      )}
                      {(order.status === 'DELIVERED' || order.status === 'CANCELLED') && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Dynamic Reviews Manager Section */}
      <div className="dashboard-card glass-panel inventory-table-card" style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 className="card-heading" style={{ margin: 0 }}><Inbox size={18} /> Quản lý đánh giá khách hàng</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Lọc sản phẩm:</span>
            <select
              value={filterPhoneId}
              onChange={(e) => setFilterPhoneId(e.target.value)}
              className="form-input form-input-sm"
              style={{ width: '220px', padding: '6px 12px' }}
            >
              <option value="all">Tất cả sản phẩm</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {loadingReviews ? (
          <div className="text-center" style={{ padding: '20px' }}>Đang tải danh sách đánh giá...</div>
        ) : (
          (() => {
            const filteredReviews = filterPhoneId === 'all'
              ? reviews
              : reviews.filter(r => r.phoneId === filterPhoneId);
            
            return filteredReviews.length === 0 ? (
              <div className="text-center" style={{ padding: '20px', color: 'var(--text-muted)' }}>Không có đánh giá nào.</div>
            ) : (
              <div className="table-wrapper">
                <table className="inventory-table">
                  <thead>
                    <tr>
                      <th>Sản Phẩm</th>
                      <th>Người Đánh Giá</th>
                      <th>Điểm Số</th>
                      <th>Nội Dung Chi Tiết</th>
                      <th>Ngày Đăng</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReviews.map(review => (
                      <tr key={review.id}>
                        <td>
                          <strong>{review.phoneName || review.phoneId}</strong>
                        </td>
                        <td>
                          <div><strong>{review.fullName || review.username}</strong></div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>@{review.username}</div>
                        </td>
                        <td>
                          <div style={{ fontSize: '1rem', color: 'var(--warning-color)', display: 'flex', gap: '2px' }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} style={{ opacity: i < review.rating ? 1 : 0.2 }}>★</span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <div style={{ maxWidth: '350px', fontSize: '0.85rem', whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-color)' }}>
                            {review.comment}
                          </div>
                        </td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {review.date}
                        </td>
                        <td>
                          <button
                            onClick={() => handleDeleteReview(review.id)}
                            className="btn-delete-product"
                            title="Xóa đánh giá"
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px' }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()
        )}
      </div>
    </div>
  );
};
