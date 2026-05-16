package com.floodrescue.floodrescuesystem.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateRescueTeamRequest {

    @NotBlank(message = "Team name is required")
    private String teamName;

    private String description;

    @NotNull(message = "Team leader ID is required")
    private Long teamLeaderId;

    private Integer memberCount;

    private String contactPhone;

    private String currentLocation;

    public CreateRescueTeamRequest() {}

    public String getTeamName() { return teamName; }
    public void setTeamName(String teamName) { this.teamName = teamName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Long getTeamLeaderId() { return teamLeaderId; }
    public void setTeamLeaderId(Long teamLeaderId) { this.teamLeaderId = teamLeaderId; }

    public Integer getMemberCount() { return memberCount; }
    public void setMemberCount(Integer memberCount) { this.memberCount = memberCount; }

    public String getContactPhone() { return contactPhone; }
    public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }

    public String getCurrentLocation() { return currentLocation; }
    public void setCurrentLocation(String currentLocation) { this.currentLocation = currentLocation; }
}
