package com.alophone.api.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class OrderItem {
    private String phoneId;
    private String phoneName;
    private String colorName;
    private String colorHex;
    private String storageSize;
    private Integer quantity;
    private Double price;

    public OrderItem() {}

    public OrderItem(String phoneId, String phoneName, String colorName, String colorHex, String storageSize, Integer quantity, Double price) {
        this.phoneId = phoneId;
        this.phoneName = phoneName;
        this.colorName = colorName;
        this.colorHex = colorHex;
        this.storageSize = storageSize;
        this.quantity = quantity;
        this.price = price;
    }

    public String getPhoneId() {
        return phoneId;
    }

    public void setPhoneId(String phoneId) {
        this.phoneId = phoneId;
    }

    public String getPhoneName() {
        return phoneName;
    }

    public void setPhoneName(String phoneName) {
        this.phoneName = phoneName;
    }

    public String getColorName() {
        return colorName;
    }

    public void setColorName(String colorName) {
        this.colorName = colorName;
    }

    public String getColorHex() {
        return colorHex;
    }

    public void setColorHex(String colorHex) {
        this.colorHex = colorHex;
    }

    public String getStorageSize() {
        return storageSize;
    }

    public void setStorageSize(String storageSize) {
        this.storageSize = storageSize;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }
}
