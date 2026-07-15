package com.alophone.api.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "phones")
public class Phone {
    @Id
    private String id;
    
    private String name;
    private String brand;
    private Double basePrice;
    private Double rating;
    private Integer reviewsCount;
    @Column(columnDefinition = "TEXT")
    private String image;
    
    @ElementCollection
    @CollectionTable(name = "phone_images", joinColumns = @JoinColumn(name = "phone_id"))
    @Column(name = "image_url", columnDefinition = "TEXT")
    private List<String> images;
    
    @ElementCollection
    @CollectionTable(name = "phone_colors", joinColumns = @JoinColumn(name = "phone_id"))
    private List<ColorOption> colors;
    
    @ElementCollection
    @CollectionTable(name = "phone_storage", joinColumns = @JoinColumn(name = "phone_id"))
    private List<StorageOption> storage;
    
    @Embedded
    private Specs specs;
    
    @Column(length = 1000)
    private String description;
    
    private String tag;
    private Integer discount;
    private Integer stock;

    public Phone() {}

    public Phone(String id, String name, String brand, Double basePrice, Double rating, Integer reviewsCount,
                 String image, List<String> images, List<ColorOption> colors, List<StorageOption> storage,
                 Specs specs, String description, String tag, Integer discount, Integer stock) {
        this.id = id;
        this.name = name;
        this.brand = brand;
        this.basePrice = basePrice;
        this.rating = rating;
        this.reviewsCount = reviewsCount;
        this.image = image;
        this.images = images;
        this.colors = colors;
        this.storage = storage;
        this.specs = specs;
        this.description = description;
        this.tag = tag;
        this.discount = discount;
        this.stock = stock;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getBrand() {
        return brand;
    }

    public void setBrand(String brand) {
        this.brand = brand;
    }

    public Double getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(Double basePrice) {
        this.basePrice = basePrice;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getReviewsCount() {
        return reviewsCount;
    }

    public void setReviewsCount(Integer reviewsCount) {
        this.reviewsCount = reviewsCount;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<ColorOption> getColors() {
        return colors;
    }

    public void setColors(List<ColorOption> colors) {
        this.colors = colors;
    }

    public List<StorageOption> getStorage() {
        return storage;
    }

    public void setStorage(List<StorageOption> storage) {
        this.storage = storage;
    }

    public Specs getSpecs() {
        return specs;
    }

    public void setSpecs(Specs specs) {
        this.specs = specs;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTag() {
        return tag;
    }

    public void setTag(String tag) {
        this.tag = tag;
    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
