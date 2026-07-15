package com.alophone.api.controller;

import com.alophone.api.config.PasswordUtil;
import com.alophone.api.model.User;
import com.alophone.api.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Verify using BCrypt
            if (PasswordUtil.checkPassword(request.getPassword(), user.getPassword())) {
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body("Tài khoản hoặc mật khẩu không chính xác!");
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().isEmpty() ||
            request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Tên tài khoản và mật khẩu không được để trống!");
        }

        String username = request.getUsername().trim();
        String email = (request.getEmail() != null && !request.getEmail().trim().isEmpty()) ? request.getEmail().trim() : null;
        String phone = (request.getPhone() != null && !request.getPhone().trim().isEmpty()) ? request.getPhone().trim() : null;

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body("Tên tài khoản đã tồn tại!");
        }

        if (email != null && !userRepository.findByEmail(email).isEmpty()) {
            return ResponseEntity.badRequest().body("Email này đã được liên kết với một tài khoản khác!");
        }

        if (phone != null && !userRepository.findByPhone(phone).isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại này đã được liên kết với một tài khoản khác!");
        }

        User newUser = new User();
        newUser.setUsername(username);
        // Hash password before saving
        newUser.setPassword(PasswordUtil.hashPassword(request.getPassword()));
        newUser.setFullName(request.getFullName() != null ? request.getFullName().trim() : "Người dùng AloPhone");
        newUser.setRole("USER"); // Default role
        newUser.setEmail(email);
        newUser.setPhone(phone);
        newUser.setAddress(request.getAddress());
        newUser.setAvatar(request.getAvatar() != null ? request.getAvatar() : "");
        newUser.setPurchasedPhoneIds(new ArrayList<>());

        User savedUser = userRepository.save(newUser);
        return ResponseEntity.ok(savedUser);
    }

    @PutMapping("/profile/{username}")
    public ResponseEntity<?> updateProfile(@PathVariable String username, @RequestBody User profileDetails) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (profileDetails.getFullName() != null) user.setFullName(profileDetails.getFullName().trim());
        
        if (profileDetails.getEmail() != null) {
            String newEmail = profileDetails.getEmail().trim();
            if (newEmail.isEmpty()) {
                user.setEmail(null);
            } else {
                List<User> existingEmailUsers = userRepository.findByEmail(newEmail);
                boolean isDuplicate = existingEmailUsers.stream().anyMatch(u -> !u.getUsername().equals(username));
                if (isDuplicate) {
                    return ResponseEntity.badRequest().body("Email này đã được liên kết với một tài khoản khác!");
                }
                user.setEmail(newEmail);
            }
        }

        if (profileDetails.getPhone() != null) {
            String newPhone = profileDetails.getPhone().trim();
            if (newPhone.isEmpty()) {
                user.setPhone(null);
            } else {
                List<User> existingPhoneUsers = userRepository.findByPhone(newPhone);
                boolean isDuplicate = existingPhoneUsers.stream().anyMatch(u -> !u.getUsername().equals(username));
                if (isDuplicate) {
                    return ResponseEntity.badRequest().body("Số điện thoại này đã được liên kết với một tài khoản khác!");
                }
                user.setPhone(newPhone);
            }
        }

        if (profileDetails.getAddress() != null) user.setAddress(profileDetails.getAddress());
        if (profileDetails.getAvatar() != null) user.setAvatar(profileDetails.getAvatar());

        User updatedUser = userRepository.save(user);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/profile/{username}/purchase")
    public ResponseEntity<?> recordPurchase(@PathVariable String username, @RequestBody List<String> phoneIds) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        if (phoneIds != null && !phoneIds.isEmpty()) {
            List<String> currentPurchases = user.getPurchasedPhoneIds();
            if (currentPurchases == null) {
                currentPurchases = new ArrayList<>();
            }
            currentPurchases.addAll(phoneIds);
            user.setPurchasedPhoneIds(currentPurchases);
            userRepository.save(user);
        }
        return ResponseEntity.ok().build();
    }

    public static class LoginRequest {
        private String username;
        private String password;

        public LoginRequest() {}

        public LoginRequest(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    public static class RegisterRequest {
        private String username;
        private String password;
        private String fullName;
        private String email;
        private String phone;
        private String address;
        private String avatar;

        public RegisterRequest() {}

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getFullName() {
            return fullName;
        }

        public void setFullName(String fullName) {
            this.fullName = fullName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPhone() {
            return phone;
        }

        public void setPhone(String phone) {
            this.phone = phone;
        }

        public String getAddress() {
            return address;
        }

        public void setAddress(String address) {
            this.address = address;
        }

        public String getAvatar() {
            return avatar;
        }

        public void setAvatar(String avatar) {
            this.avatar = avatar;
        }
    }
}
