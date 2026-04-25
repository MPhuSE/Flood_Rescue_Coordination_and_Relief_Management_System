package com.floodrescue.floodrescuesystem.dto.request;

import jakarta.validation.constraints.NotNull;

public class VerifyRescueRequestDTO {

    @NotNull(message = "Trạng thái xác minh không được để trống")
    private Boolean approved;

    private String notes;

    public VerifyRescueRequestDTO() {}

    public VerifyRescueRequestDTO(Boolean approved, String notes) {
        this.approved = approved;
        this.notes = notes;
    }

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
