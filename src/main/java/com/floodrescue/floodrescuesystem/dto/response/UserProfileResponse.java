package com.floodrescue.floodrescuesystem.dto.response;

import com.floodrescue.floodrescuesystem.entity.User;

import java.time.LocalDateTime;

public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String phone;
    private String address;
    private String avatarUrl;
    private String status;
    private String role;
    private LocalDateTime lastLoginAt;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String fullName, String username, String email, String phone,
                               String address, String avatarUrl, String status, String role,
                               LocalDateTime lastLoginAt) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.phone = phone;
        this.address = address;
        this.avatarUrl = avatarUrl;
        this.status = status;
        this.role = role;
        this.lastLoginAt = lastLoginAt;
    }

    public static UserProfileResponse fromUser(User user) {
        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone(),
                user.getAddress(),
                user.getAvatarUrl(),
                user.getStatus(),
                roleName,
                user.getLastLoginAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}
