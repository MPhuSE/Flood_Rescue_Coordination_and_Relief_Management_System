package com.floodrescue.floodrescuesystem.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rescue_teams")
public class RescueTeam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long teamId;

    @Column(nullable = false)
    private String teamName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "team_leader_id")
    private Long teamLeaderId;

    @Column(name = "member_count")
    private Integer memberCount;

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    private TeamStatus status;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "assignedTeam")
    private List<RescueRequest> rescueRequests = new ArrayList<>();

    public RescueTeam() {
        this.createdAt = LocalDateTime.now();
        this.status = TeamStatus.ACTIVE;
    }

    public RescueTeam(String teamName, String description, Long teamLeaderId) {
        this();
        this.teamName = teamName;
        this.description = description;
        this.teamLeaderId = teamLeaderId;
    }

    // Getters and Setters
    public Long getTeamId() {
        return teamId;
    }

    public void setTeamId(Long teamId) {
        this.teamId = teamId;
    }

    public String getTeamName() {
        return teamName;
    }

    public void setTeamName(String teamName) {
        this.teamName = teamName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getTeamLeaderId() {
        return teamLeaderId;
    }

    public void setTeamLeaderId(Long teamLeaderId) {
        this.teamLeaderId = teamLeaderId;
    }

    public Integer getMemberCount() {
        return memberCount;
    }

    public void setMemberCount(Integer memberCount) {
        this.memberCount = memberCount;
    }

    public TeamStatus getStatus() {
        return status;
    }

    public void setStatus(TeamStatus status) {
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<RescueRequest> getRescueRequests() {
        return rescueRequests;
    }

    public void setRescueRequests(List<RescueRequest> rescueRequests) {
        this.rescueRequests = rescueRequests;
    }

    public enum TeamStatus {
        ACTIVE("Hoạt động"),
        INACTIVE("Không hoạt động"),
        ON_DUTY("Đang làm nhiệm vụ");

        private final String displayName;

        TeamStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
