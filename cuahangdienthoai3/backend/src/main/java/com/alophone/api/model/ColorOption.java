package com.alophone.api.model;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;

@Embeddable
public class ColorOption {
    private String name;
    private String hex;
    
    @Column(columnDefinition = "TEXT")
    private String image;

    public ColorOption() {}

    public ColorOption(String name, String hex, String image) {
        this.name = name;
        this.hex = hex;
        this.image = image;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getHex() {
        return hex;
    }

    public void setHex(String hex) {
        this.hex = hex;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
