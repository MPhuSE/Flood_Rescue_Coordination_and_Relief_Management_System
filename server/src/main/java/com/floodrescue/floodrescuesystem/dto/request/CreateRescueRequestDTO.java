package com.floodrescue.floodrescuesystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRescueRequestDTO {

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotBlank(message = "Địa điểm không được để trống")
    private String location;

    private Double latitude;
    private Double longitude;

    private String image;

    @NotNull(message = "Mức độ khẩn cấp không được để trống")
    private String urgencyLevel;

    public CreateRescueRequestDTO() {}

    public CreateRescueRequestDTO(String description, String location, 
                                  Double latitude, Double longitude, 
                                  String image, String urgencyLevel) {
        this.description = description;
        this.location = location;
        this.latitude = latitude;
        this.longitude = longitude;
        this.image = image;
        this.urgencyLevel = urgencyLevel;
    }

    // Getters and Setters
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }
}
