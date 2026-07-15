package com.alophone.api.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class Specs {
    private String screen;
    private String cpu;
    private String ram;
    private String rom;
    private String battery;
    private String camera;
    private String os;
    private String weight;

    public Specs() {}

    public Specs(String screen, String cpu, String ram, String rom, String battery, String camera, String os, String weight) {
        this.screen = screen;
        this.cpu = cpu;
        this.ram = ram;
        this.rom = rom;
        this.battery = battery;
        this.camera = camera;
        this.os = os;
        this.weight = weight;
    }

    public String getScreen() {
        return screen;
    }

    public void setScreen(String screen) {
        this.screen = screen;
    }

    public String getCpu() {
        return cpu;
    }

    public void setCpu(String cpu) {
        this.cpu = cpu;
    }

    public String getRam() {
        return ram;
    }

    public void setRam(String ram) {
        this.ram = ram;
    }

    public String getRom() {
        return rom;
    }

    public void setRom(String rom) {
        this.rom = rom;
    }

    public String getBattery() {
        return battery;
    }

    public void setBattery(String battery) {
        this.battery = battery;
    }

    public String getCamera() {
        return camera;
    }

    public void setCamera(String camera) {
        this.camera = camera;
    }

    public String getOs() {
        return os;
    }

    public void setOs(String os) {
        this.os = os;
    }

    public String getWeight() {
        return weight;
    }

    public void setWeight(String weight) {
        this.weight = weight;
    }
}
