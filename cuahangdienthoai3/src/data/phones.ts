export interface PhoneColor {
  name: string;
  hex: string;
  image: string;
}

export interface PhoneStorage {
  size: string;
  priceOffset: number;
}

export interface PhoneSpecs {
  screen: string;
  cpu: string;
  ram: string;
  rom: string;
  battery: string;
  camera: string;
  os: string;
  weight: string;
}

export interface Phone {
  id: string;
  name: string;
  brand: string;
  basePrice: number;
  rating: number;
  reviewsCount: number;
  image: string;
  images: string[];
  colors: PhoneColor[];
  storage: PhoneStorage[];
  specs: PhoneSpecs;
  description: string;
  tag: 'New' | 'Best Seller' | 'Hot Deal' | 'None';
  discount: number; // percentage
  stock: number;
}

export const phonesData: Phone[] = [
  {
    id: 'iphone-15-pro-max',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    basePrice: 34990000, // VND
    rating: 4.9,
    reviewsCount: 1240,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1695048133140-fd974b7cd9af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Titan Tự Nhiên', hex: '#8a8885', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Titan Xanh', hex: '#2f4452', image: 'https://images.unsplash.com/photo-1695048133140-fd974b7cd9af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Titan Đen', hex: '#3b3c3d', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '256GB', priceOffset: 0 },
      { size: '512GB', priceOffset: 6000000 },
      { size: '1TB', priceOffset: 12000000 }
    ],
    specs: {
      screen: '6.7 inches, Super Retina XDR OLED, 120Hz',
      cpu: 'Apple A17 Pro (3nm)',
      ram: '8 GB',
      rom: '256 GB / 512 GB / 1 TB',
      battery: '4441 mAh, Sạc nhanh 25W',
      camera: 'Chính 48MP & Phụ 12MP, 12MP, Zoom quang 5x',
      os: 'iOS 17 (Nâng cấp lên iOS 18)',
      weight: '221 g'
    },
    description: 'iPhone 15 Pro Max là đỉnh cao công nghệ của Apple với khung viền Titanium chuẩn hàng không vũ trụ siêu bền nhẹ, nút Tác Vụ (Action Button) mới đột phá, hệ thống camera thu phóng quang học 5x chuyên nghiệp nhất từng có và chip xử lý A17 Pro siêu mạnh chơi game console đỉnh cao.',
    tag: 'Best Seller',
    discount: 5,
    stock: 24
  },
  {
    id: 'samsung-galaxy-s24-ultra',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    basePrice: 29990000,
    rating: 4.8,
    reviewsCount: 890,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Xám Titanium', hex: '#77787b', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Đen Titanium', hex: '#212224', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Vàng Titanium', hex: '#ded0b6', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '256GB', priceOffset: 0 },
      { size: '512GB', priceOffset: 4500000 },
      { size: '1TB', priceOffset: 9500000 }
    ],
    specs: {
      screen: '6.8 inches, Dynamic AMOLED 2X, QHD+, 120Hz',
      cpu: 'Snapdragon 8 Gen 3 for Galaxy',
      ram: '12 GB',
      rom: '256 GB / 512 GB / 1 TB',
      battery: '5000 mAh, Sạc nhanh 45W',
      camera: 'Mắt thần bóng đêm 200MP, siêu thu phóng 100x',
      os: 'Android 14, One UI 6.1',
      weight: '232 g'
    },
    description: 'Samsung Galaxy S24 Ultra mở ra kỷ nguyên quyền năng Galaxy AI hoàn toàn mới. Viết chương tiếp theo cho sự sáng tạo với bút S Pen tích hợp, dịch thuật trực tiếp cuộc gọi, khoanh vùng search đa nhiệm thông minh cùng khung viền Titanium chắc chắn.',
    tag: 'Hot Deal',
    discount: 10,
    stock: 15
  },
  {
    id: 'xiaomi-14-ultra',
    name: 'Xiaomi 14 Ultra',
    brand: 'Xiaomi',
    basePrice: 27990000,
    rating: 4.7,
    reviewsCount: 340,
    image: 'https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Đen Da', hex: '#1c1c1c', image: 'https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Trắng Da', hex: '#eceae6', image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '256GB', priceOffset: 0 },
      { size: '512GB', priceOffset: 3000000 }
    ],
    specs: {
      screen: '6.73 inches, LTPO AMOLED, WQHD+, 120Hz',
      cpu: 'Snapdragon 8 Gen 3',
      ram: '16 GB',
      rom: '256 GB / 512 GB',
      battery: '5000 mAh, Sạc nhanh 90W',
      camera: 'Hệ thống 4 camera Leica 50MP, cảm biến chính 1 inch',
      os: 'Android 14, Xiaomi HyperOS',
      weight: '220 g'
    },
    description: 'Đỉnh cao nhiếp ảnh di động kết hợp cùng Leica danh tiếng. Xiaomi 14 Ultra sở hữu cảm biến chính Sony LYT-900 kích thước lớn 1 inch siêu nhạy sáng, khẩu độ thay đổi liên tục F1.63 - F4.0, mang lại hiệu ứng bokeh tự nhiên mượt mà cùng màn hình cong bốn cạnh sang trọng.',
    tag: 'New',
    discount: 8,
    stock: 8
  },
  {
    id: 'oneplus-12',
    name: 'OnePlus 12',
    brand: 'OnePlus',
    basePrice: 21990000,
    rating: 4.6,
    reviewsCount: 210,
    image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Xanh Lục Bảo', hex: '#17362a', image: 'https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Đen Đá', hex: '#232526', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '256GB', priceOffset: 0 },
      { size: '512GB', priceOffset: 2500000 }
    ],
    specs: {
      screen: '6.82 inches, AMOLED ProXDR, 2K, 120Hz',
      cpu: 'Snapdragon 8 Gen 3',
      ram: '16 GB',
      rom: '256 GB / 512 GB',
      battery: '5400 mAh, Sạc nhanh SuperVOOC 100W',
      camera: 'Camera Hasselblad thế hệ 4: 50MP + 64MP + 48MP',
      os: 'Android 14, OxygenOS 14',
      weight: '220 g'
    },
    description: 'OnePlus 12 định nghĩa lại khái niệm Flagship mượt mà thực thụ. Được cung cấp năng lượng bởi cấu hình khủng nhất năm cùng hệ thống tản nhiệt buồng hơi siêu lớn, công nghệ sạc thần tốc 100W đầy pin chỉ trong 26 phút và camera Hasselblad nghệ thuật.',
    tag: 'New',
    discount: 12,
    stock: 12
  },
  {
    id: 'google-pixel-8-pro',
    name: 'Google Pixel 8 Pro',
    brand: 'Google',
    basePrice: 19990000,
    rating: 4.7,
    reviewsCount: 450,
    image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Xanh Vịnh Kỷ', hex: '#87a8cb', image: 'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Đen Obsidian', hex: '#2a2b2c', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '128GB', priceOffset: 0 },
      { size: '256GB', priceOffset: 2000000 },
      { size: '512GB', priceOffset: 5000000 }
    ],
    specs: {
      screen: '6.7 inches, LTPO OLED, Super Actua, 120Hz',
      cpu: 'Google Tensor G3 (4nm)',
      ram: '12 GB',
      rom: '128 GB / 256 GB / 512 GB',
      battery: '5050 mAh, Sạc nhanh 30W',
      camera: 'Cụm ba camera AI: 50MP + 48MP + 48MP',
      os: 'Android 14 (Cam kết cập nhật 7 năm)',
      weight: '213 g'
    },
    description: 'Bộ não trí tuệ nhân tạo đỉnh cao của Google. Pixel 8 Pro mang lại trải nghiệm Android thuần khiết mượt mà tuyệt đối, công cụ chỉnh sửa ảnh ma thuật Magic Eraser, Best Take và quay video đêm Night Sight cải tiến nhờ chip Tensor G3 tùy biến sâu.',
    tag: 'Best Seller',
    discount: 15,
    stock: 19
  },
  {
    id: 'iphone-15',
    name: 'iPhone 15',
    brand: 'Apple',
    basePrice: 19990000,
    rating: 4.8,
    reviewsCount: 650,
    image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Đen Mờ', hex: '#262626', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Xanh Dương Nhạt', hex: '#d2e0e6', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '128GB', priceOffset: 0 },
      { size: '256GB', priceOffset: 3000000 },
      { size: '512GB', priceOffset: 8000000 }
    ],
    specs: {
      screen: '6.1 inches, Super Retina XDR OLED, Dynamic Island',
      cpu: 'Apple A16 Bionic (4nm)',
      ram: '6 GB',
      rom: '128 GB / 256 GB / 512 GB',
      battery: '3349 mAh, Sạc nhanh 20W',
      camera: 'Chính 48MP & Phụ 12MP, Zoom quang 2x',
      os: 'iOS 17',
      weight: '171 g'
    },
    description: 'Trải nghiệm đỉnh cao với thiết kế Dynamic Island nay đã xuất hiện trên iPhone 15 thường. Sở hữu mặt lưng kính pha màu sang trọng, cổng sạc USB-C phổ biến tiện lợi cùng camera chính nâng cấp vượt trội lên 48MP siêu nét.',
    tag: 'None',
    discount: 10,
    stock: 35
  },
  {
    id: 'samsung-galaxy-s24-plus',
    name: 'Samsung Galaxy S24+',
    brand: 'Samsung',
    basePrice: 22990000,
    rating: 4.6,
    reviewsCount: 310,
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'
    ],
    colors: [
      { name: 'Đen Onyx', hex: '#212224', image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' },
      { name: 'Xám Marble', hex: '#77787b', image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3' }
    ],
    storage: [
      { size: '256GB', priceOffset: 0 },
      { size: '512GB', priceOffset: 3500000 }
    ],
    specs: {
      screen: '6.7 inches, Dynamic AMOLED 2X, QHD+, 120Hz',
      cpu: 'Exynos 2400 (4nm)',
      ram: '12 GB',
      rom: '256 GB / 512 GB',
      battery: '4900 mAh, Sạc nhanh 45W',
      camera: 'Chính 50MP & Phụ 10MP, 12MP, Zoom quang 3x',
      os: 'Android 14, One UI 6.1',
      weight: '196 g'
    },
    description: 'Sự cân bằng hoàn hảo giữa kích thước màn hình lớn và độ mỏng nhẹ tinh tế. Galaxy S24+ mang trên mình sức mạnh AI thông minh, RAM nâng cấp lên 12GB và pin siêu lớn gần bằng bản Ultra, đi kèm màn hình QHD+ sắc nét tuyệt hảo.',
    tag: 'None',
    discount: 8,
    stock: 22
  }
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
