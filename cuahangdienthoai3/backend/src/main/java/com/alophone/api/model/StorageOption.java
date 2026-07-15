package com.alophone.api.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class StorageOption {
    private String size;
    private Double priceOffset;

    public StorageOption() {}

    public StorageOption(String size, Double priceOffset) {
        this.size = size;
        this.priceOffset = priceOffset;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public Double getPriceOffset() {
        return priceOffset;
    }

    public void setPriceOffset(Double priceOffset) {
        this.priceOffset = priceOffset;
    }
}
