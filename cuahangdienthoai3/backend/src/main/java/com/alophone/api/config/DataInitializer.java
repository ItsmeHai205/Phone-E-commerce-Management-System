package com.alophone.api.config;

import com.alophone.api.model.*;
import com.alophone.api.repository.PhoneRepository;
import com.alophone.api.repository.UserRepository;
import com.alophone.api.repository.OrderRepository;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private PhoneRepository phoneRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private com.alophone.api.repository.ReviewRepository reviewRepository;

    @Override
    public void run(String... args) throws Exception {
        // Migration: Alter existing column types to TEXT to support Base64 images
        try {
            jdbcTemplate.execute("ALTER TABLE phones ALTER COLUMN image TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE phone_images ALTER COLUMN image_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE phone_colors ALTER COLUMN image TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN avatar TYPE TEXT");
            System.out.println("SQL Migration: Successfully migrated image columns to TEXT.");
        } catch (Exception e) {
            System.err.println("SQL Migration Warning: Column migration skipped or failed (table might not exist yet): " + e.getMessage());
        }

        // Seed default users
        if (userRepository.count() == 0) {
            User admin = new User(
                null, 
                "admin", 
                PasswordUtil.hashPassword("admin"), 
                "Quản Trị Viên", 
                "ADMIN",
                "admin@alophone.vn",
                "0987654321",
                "123 Đường Cầu Giấy, Hà Nội",
                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=60",
                new ArrayList<>()
            );
            
            User customer = new User(
                null, 
                "user", 
                PasswordUtil.hashPassword("123456"), 
                "Khách Hàng Thân Thiết", 
                "USER",
                "customer@gmail.com",
                "0912345678",
                "456 Đường Trần Hưng Đạo, Đà Nẵng",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60",
                new ArrayList<>(Arrays.asList("iphone-15-pro-max", "samsung-galaxy-s24-ultra"))
            );
            userRepository.saveAll(Arrays.asList(admin, customer));
        } else {
            // Self-healing: Scan all existing users, hash plaintext passwords, and clean duplicate emails/phones
            List<User> allUsers = userRepository.findAll();
            java.util.Set<String> seenEmails = new java.util.HashSet<>();
            java.util.Set<String> seenPhones = new java.util.HashSet<>();
            boolean updatedAny = false;
            
            for (User u : allUsers) {
                // Clear duplicate email if already seen
                if (u.getEmail() != null && !u.getEmail().trim().isEmpty()) {
                    String emailLower = u.getEmail().trim().toLowerCase();
                    if (seenEmails.contains(emailLower)) {
                        u.setEmail(null);
                        updatedAny = true;
                    } else {
                        seenEmails.add(emailLower);
                    }
                }
                
                // Clear duplicate phone if already seen
                if (u.getPhone() != null && !u.getPhone().trim().isEmpty()) {
                    String phoneTrimmed = u.getPhone().trim();
                    if (seenPhones.contains(phoneTrimmed)) {
                        u.setPhone(null);
                        updatedAny = true;
                    } else {
                        seenPhones.add(phoneTrimmed);
                    }
                }

                if (u.getPassword() == null) {
                    continue;
                }
                if (u.getUsername().equals("admin") && !PasswordUtil.checkPassword("admin", u.getPassword())) {
                    u.setPassword(PasswordUtil.hashPassword("admin"));
                    updatedAny = true;
                } else if (u.getUsername().equals("user") && !PasswordUtil.checkPassword("123456", u.getPassword())) {
                    u.setPassword(PasswordUtil.hashPassword("123456"));
                    updatedAny = true;
                } else if (!u.getPassword().startsWith("$2a$")) {
                    u.setPassword(PasswordUtil.hashPassword(u.getPassword()));
                    updatedAny = true;
                }
            }
            if (updatedAny) {
                userRepository.saveAll(allUsers);
                System.out.println("Self-healing: Cleared duplicate user emails/phones and updated passwords.");
            }
        }

        // Seed products catalog
        if (phoneRepository.count() == 0) {
            List<Phone> phones = new ArrayList<>();

            // 1. iPhone 15 Pro Max
            Phone iphone15ProMax = new Phone(
                "iphone-15-pro-max",
                "iPhone 15 Pro Max",
                "Apple",
                34990000.0,
                4.9,
                1240,
                "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1695048133140-fd974b7cd9af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Titan Tự Nhiên", "#8a8885", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Titan Xanh", "#2f4452", "https://images.unsplash.com/photo-1695048133140-fd974b7cd9af?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Titan Đen", "#3b3c3d", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("256GB", 0.0),
                    new StorageOption("512GB", 6000000.0),
                    new StorageOption("1TB", 12000000.0)
                ),
                new Specs(
                    "6.7 inches, Super Retina XDR OLED, 120Hz",
                    "Apple A17 Pro (3nm)",
                    "8 GB",
                    "256 GB / 512 GB / 1 TB",
                    "4441 mAh, Sạc nhanh 25W",
                    "Chính 48MP & Phụ 12MP, 12MP, Zoom quang 5x",
                    "iOS 17 (Nâng cấp lên iOS 18)",
                    "221 g"
                ),
                "iPhone 15 Pro Max là đỉnh cao công nghệ của Apple với khung viền Titanium chuẩn hàng không vũ trụ siêu bền nhẹ, nút Tác Vụ (Action Button) mới đột phá, hệ thống camera thu phóng quang học 5x chuyên nghiệp nhất từng có và chip xử lý A17 Pro siêu mạnh chơi game console đỉnh cao.",
                "Best Seller",
                5,
                24
            );
            phones.add(iphone15ProMax);

            // 2. Samsung Galaxy S24 Ultra
            Phone s24Ultra = new Phone(
                "samsung-galaxy-s24-ultra",
                "Samsung Galaxy S24 Ultra",
                "Samsung",
                29990000.0,
                4.8,
                890,
                "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Xám Titanium", "#77787b", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Đen Titanium", "#212224", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Vàng Titanium", "#ded0b6", "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("256GB", 0.0),
                    new StorageOption("512GB", 4500000.0),
                    new StorageOption("1TB", 9500000.0)
                ),
                new Specs(
                    "6.8 inches, Dynamic AMOLED 2X, QHD+, 120Hz",
                    "Snapdragon 8 Gen 3 for Galaxy",
                    "12 GB",
                    "256 GB / 512 GB / 1 TB",
                    "5000 mAh, Sạc nhanh 45W",
                    "Mắt thần bóng đêm 200MP, siêu thu phóng 100x",
                    "Android 14, One UI 6.1",
                    "232 g"
                ),
                "Samsung Galaxy S24 Ultra mở ra kỷ nguyên quyền năng Galaxy AI hoàn toàn mới. Viết chương tiếp theo cho sự sáng tạo với bút S Pen tích hợp, dịch thuật trực tiếp cuộc gọi, khoanh vùng search đa nhiệm thông minh cùng khung viền Titanium chắc chắn.",
                "Hot Deal",
                10,
                15
            );
            phones.add(s24Ultra);

            // 3. Xiaomi 14 Ultra
            Phone xiaomi14 = new Phone(
                "xiaomi-14-ultra",
                "Xiaomi 14 Ultra",
                "Xiaomi",
                27990000.0,
                4.7,
                340,
                "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Đen Da", "#1c1c1c", "https://images.unsplash.com/photo-1598327106026-d9521da673d1?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Trắng Da", "#eceae6", "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("256GB", 0.0),
                    new StorageOption("512GB", 3000000.0)
                ),
                new Specs(
                    "6.73 inches, LTPO AMOLED, WQHD+, 120Hz",
                    "Snapdragon 8 Gen 3",
                    "16 GB",
                    "256 GB / 512 GB",
                    "5000 mAh, Sạc nhanh 90W",
                    "Hệ thống 4 camera Leica 50MP, cảm biến chính 1 inch",
                    "Android 14, Xiaomi HyperOS",
                    "220 g"
                ),
                "Đỉnh cao nhiếp ảnh di động kết hợp cùng Leica danh tiếng. Xiaomi 14 Ultra sở hữu cảm biến chính Sony LYT-900 kích thước lớn 1 inch siêu nhạy sáng, khẩu độ thay đổi liên tục F1.63 - F4.0, mang lại hiệu ứng bokeh tự nhiên mượt mà cùng màn hình cong đóng cạnh sang trọng.",
                "New",
                8,
                8
            );
            phones.add(xiaomi14);

            // 4. OnePlus 12
            Phone oneplus12 = new Phone(
                "oneplus-12",
                "OnePlus 12",
                "OnePlus",
                21990000.0,
                4.6,
                210,
                "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Xanh Lục Bảo", "#17362a", "https://images.unsplash.com/photo-1565630916779-e303be97b6f5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Đen Đá", "#232526", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("256GB", 0.0),
                    new StorageOption("512GB", 2500000.0)
                ),
                new Specs(
                    "6.82 inches, AMOLED ProXDR, 2K, 120Hz",
                    "Snapdragon 8 Gen 3",
                    "16 GB",
                    "256 GB / 512 GB",
                    "5400 mAh, Sạc nhanh SuperVOOC 100W",
                    "Camera Hasselblad thế hệ 4: 50MP + 64MP + 48MP",
                    "Android 14, OxygenOS 14",
                    "220 g"
                ),
                "OnePlus 12 định nghĩa lại khái niệm Flagship mượt mà thực thụ. Được cung cấp năng lượng bởi cấu hình khủng nhất năm cùng hệ thống tản nhiệt buồng hơi siêu lớn, công nghệ sạc thần tốc 100W đầy pin chỉ trong 26 phút và camera Hasselblad nghệ thuật.",
                "New",
                12,
                12
            );
            phones.add(oneplus12);

            // 5. Google Pixel 8 Pro
            Phone pixel8 = new Phone(
                "google-pixel-8-pro",
                "Google Pixel 8 Pro",
                "Google",
                19990000.0,
                4.7,
                450,
                "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Xanh Vịnh Kỷ", "#87a8cb", "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Đen Obsidian", "#2a2b2c", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("128GB", 0.0),
                    new StorageOption("256GB", 2000000.0),
                    new StorageOption("512GB", 5000000.0)
                ),
                new Specs(
                    "6.7 inches, LTPO OLED, Super Actua, 120Hz",
                    "Google Tensor G3 (4nm)",
                    "12 GB",
                    "128 GB / 256 GB / 512 GB",
                    "5050 mAh, Sạc nhanh 30W",
                    "Cụm ba camera AI: 50MP + 48MP + 48MP",
                    "Android 14 (Cam kết cập nhật 7 năm)",
                    "213 g"
                ),
                "Bộ não trí tuệ nhân tạo đỉnh cao của Google. Pixel 8 Pro mang lại trải nghiệm Android thuần khiết mượt mà tuyệt đối, công cụ chỉnh sửa ảnh ma thuật Magic Eraser, Best Take và quay video đêm Night Sight cải tiến nhờ chip Tensor G3 tùy biến sâu.",
                "Best Seller",
                15,
                19
            );
            phones.add(pixel8);

            // 6. iPhone 15
            Phone iphone15 = new Phone(
                "iphone-15",
                "iPhone 15",
                "Apple",
                19990000.0,
                4.8,
                650,
                "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Đen Mờ", "#262626", "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Xanh Dương Nhạt", "#d2e0e6", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("128GB", 0.0),
                    new StorageOption("256GB", 3000000.0),
                    new StorageOption("512GB", 8000000.0)
                ),
                new Specs(
                    "6.1 inches, Super Retina XDR OLED, Dynamic Island",
                    "Apple A16 Bionic (4nm)",
                    "6 GB",
                    "128 GB / 256 GB / 512 GB",
                    "3349 mAh, Sạc nhanh 20W",
                    "Chính 48MP & Phụ 12MP, Zoom quang 2x",
                    "iOS 17",
                    "171 g"
                ),
                "Trải nghiệm đỉnh cao với thiết kế Dynamic Island nay đã xuất hiện trên iPhone 15 thường. Sở hữu mặt lưng kính pha màu sang trọng, cổng sạc USB-C phổ biến tiện lợi cùng camera chính nâng cấp vượt trội lên 48MP siêu nét.",
                "None",
                10,
                35
            );
            phones.add(iphone15);

            // 7. Samsung Galaxy S24 Plus
            Phone s24Plus = new Phone(
                "samsung-galaxy-s24-plus",
                "Samsung Galaxy S24+",
                "Samsung",
                22990000.0,
                4.6,
                310,
                "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                Arrays.asList(
                    "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
                    "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                ),
                Arrays.asList(
                    new ColorOption("Đen Onyx", "#212224", "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"),
                    new ColorOption("Xám Marble", "#77787b", "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3")
                ),
                Arrays.asList(
                    new StorageOption("256GB", 0.0),
                    new StorageOption("512GB", 3500000.0)
                ),
                new Specs(
                    "6.7 inches, Dynamic AMOLED 2X, QHD+, 120Hz",
                    "Exynos 2400 (4nm)",
                    "12 GB",
                    "256 GB / 512 GB",
                    "4900 mAh, Sạc nhanh 45W",
                    "Chính 50MP & Phụ 10MP, 12MP, Zoom quang 3x",
                    "Android 14, One UI 6.1",
                    "196 g"
                ),
                "Sự cân bằng hoàn hảo giữa kích thước màn hình lớn và độ mỏng nhẹ tinh tế. Galaxy S24+ mang trên mình sức mạnh AI thông minh, RAM nâng cấp lên 12GB và pin siêu lớn gần bằng bản Ultra, đi kèm màn hình QHD+ sắc nét tuyệt hảo.",
                "None",
                8,
                22
            );
            phones.add(s24Plus);

            phoneRepository.saveAll(phones);
        }

        // Seed default orders
        if (orderRepository.count() == 0) {
            List<Order> orders = new ArrayList<>();

            // Order 1: PENDING
            Order order1 = new Order(
                "ALO-385012",
                "user",
                "Nguyễn Văn An",
                "0987654321",
                "an.nguyen@gmail.com",
                "Số 12 Ngõ 45 Đường Cầu Giấy, Quận Cầu Giấy, Hà Nội",
                "Giao giờ hành chính giúp em.",
                "cod",
                "PENDING",
                LocalDateTime.now().minusHours(2),
                33240500.0,
                Arrays.asList(
                    new OrderItem("iphone-15-pro-max", "iPhone 15 Pro Max", "Titan Tự Nhiên", "#8a8885", "256GB", 1, 33240500.0)
                )
            );
            orders.add(order1);

            // Order 2: SHIPPED
            Order order2 = new Order(
                "ALO-928174",
                "user",
                "Trần Thị Bình",
                "0912345678",
                "binh.tran@yahoo.com",
                "Phòng 502 Chung Cư Sunrise, Đường Trần Hưng Đạo, Quận Sơn Trà, Đà Nẵng",
                "Gọi điện trước khi giao hàng.",
                "transfer",
                "SHIPPED",
                LocalDateTime.now().minusDays(1),
                28490000.0,
                Arrays.asList(
                    new OrderItem("samsung-galaxy-s24-ultra", "Samsung Galaxy S24 Ultra", "Xám Titanium", "#77787b", "256GB", 1, 28490000.0)
                )
            );
            orders.add(order2);

            // Order 3: SHIPPED
            Order order3 = new Order(
                "ALO-481029",
                "user",
                "Lê Hoàng Nam",
                "0909998887",
                "nam.le@outlook.com",
                "789 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh",
                "",
                "installment",
                "SHIPPED",
                LocalDateTime.now().minusDays(3),
                63480000.0,
                Arrays.asList(
                    new OrderItem("iphone-15-pro-max", "iPhone 15 Pro Max", "Titan Xanh", "#2f4452", "256GB", 1, 33240500.0),
                    new OrderItem("samsung-galaxy-s24-ultra", "Samsung Galaxy S24 Ultra", "Đen Titanium", "#212224", "256GB", 1, 28490000.0)
                )
            );
            orders.add(order3);

            // Order 4: CANCELLED
            Order order4 = new Order(
                "ALO-102938",
                "user",
                "Phạm Minh Đức",
                "0933445566",
                "duc.pham@gmail.com",
                "Số 5 Lô B, Cư Xá Thanh Đa, Quận Bình Thạnh, TP. Hồ Chí Minh",
                "Đổi ý mua máy khác.",
                "cod",
                "CANCELLED",
                LocalDateTime.now().minusDays(5),
                15990000.0,
                Arrays.asList(
                    new OrderItem("xiaomi-14", "Xiaomi 14", "Xanh Jade", "#3b5e4f", "128GB", 1, 15990000.0)
                )
            );
            orders.add(order4);

            orderRepository.saveAll(orders);
        }

        // Seed default reviews
        if (reviewRepository.count() == 0) {
            List<Review> reviews = Arrays.asList(
                new Review(null, "iphone-15-pro-max", "iPhone 15 Pro Max", "user", "Nguyễn Văn An", 5, "Máy dùng siêu mượt, pin trâu, camera zoom 5x chụp nét căng. Rất đáng đồng tiền bát gạo!", "22/05/2026"),
                new Review(null, "iphone-15-pro-max", "iPhone 15 Pro Max", "user", "Trần Thị Bình", 5, "Màu Titan tự nhiên bên ngoài đẹp hơn trong ảnh nhiều. Nhân viên tư vấn nhiệt tình, giao hàng nhanh.", "18/05/2026"),
                new Review(null, "iphone-15-pro-max", "iPhone 15 Pro Max", "user", "Phạm Minh Đức", 4, "Mọi thứ đều hoàn hảo ngoại trừ giá hơi cao. Sạc nhanh 25W cũng tàm tạm chứ chưa phải nhanh nhất.", "10/05/2026"),
                new Review(null, "samsung-galaxy-s24-ultra", "Samsung Galaxy S24 Ultra", "user", "Lê Văn An", 5, "Bút S Pen viết vẽ rất tiện, dịch thuật AI chuẩn xác cực kỳ. Màn hình chống chói siêu tốt luôn.", "05/06/2026"),
                new Review(null, "samsung-galaxy-s24-ultra", "Samsung Galaxy S24 Ultra", "user", "Nguyễn Thị Bình", 4, "Máy cầm đầm tay, chụp hình zoom xa 100x nét phết nhưng máy nhanh nóng khi quay phim ngoài trời.", "03/06/2026")
            );
            reviewRepository.saveAll(reviews);
            
            // Re-calculate the average ratings and reviewsCount for seeded items
            for (String phoneId : Arrays.asList("iphone-15-pro-max", "samsung-galaxy-s24-ultra")) {
                Phone phone = phoneRepository.findById(phoneId).orElse(null);
                if (phone != null) {
                    List<Review> phoneReviews = reviewRepository.findByPhoneIdOrderByIdDesc(phoneId);
                    int count = phoneReviews.size();
                    double sum = phoneReviews.stream().mapToInt(Review::getRating).sum();
                    double avg = Math.round((sum / count) * 10.0) / 10.0;
                    phone.setReviewsCount(count);
                    phone.setRating(avg);
                    phoneRepository.save(phone);
                }
            }
            System.out.println("Seed reviews completed.");
        }
    }
}
