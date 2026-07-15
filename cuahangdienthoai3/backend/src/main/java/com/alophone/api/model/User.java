package com.alophone.api.model;

import jakarta.persistence.*;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    private String fullName;
    private String role; // "USER" or "ADMIN"
    
    @Column(unique = true)
    private String email;

    @Column(unique = true)
    private String phone;
    
    private String address;
    
    @Column(columnDefinition = "TEXT")
    private String avatar;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_purchased_phones", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "phone_id")
    private List<String> purchasedPhoneIds = new ArrayList<>();

    public User() {}

    public User(Long id, String username, String password, String fullName, String role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
    }

    public User(Long id, String username, String password, String fullName, String role, 
                String email, String phone, String address, String avatar, List<String> purchasedPhoneIds) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.role = role;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.avatar = avatar;
        if (purchasedPhoneIds != null) {
            this.purchasedPhoneIds = purchasedPhoneIds;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
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

    public List<String> getPurchasedPhoneIds() {
        return purchasedPhoneIds;
    }

    public void setPurchasedPhoneIds(List<String> purchasedPhoneIds) {
        this.purchasedPhoneIds = purchasedPhoneIds;
    }
}
