package com.floodrescue.floodrescuesystem.entity;

public enum RequestStatus {
    PENDING("Đang chờ"),
    ASSIGNED("Được giao"),
    IN_PROGRESS("Đang xử lý"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Bị hủy"),
    REJECTED("Bị từ chối");

    private final String displayName;

    RequestStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
