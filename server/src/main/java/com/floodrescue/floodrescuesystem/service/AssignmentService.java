package com.floodrescue.floodrescuesystem.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import com.floodrescue.floodrescuesystem.dto.request.AssignTeamRequestDTO;
import com.floodrescue.floodrescuesystem.entity.RequestStatus;
import com.floodrescue.floodrescuesystem.entity.RescueRequest;
import com.floodrescue.floodrescuesystem.entity.RescueTeam;
import com.floodrescue.floodrescuesystem.repository.RescueRequestRepository;
import com.floodrescue.floodrescuesystem.repository.RescueTeamRepository;

import jakarta.transaction.Transactional;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final RescueRequestRepository requestRepository;
    private final RescueTeamRepository teamRepository;

    @Transactional
    public void AssignTeam(AssignTeamRequestDTO dto) {
        RescueRequest request = requestRepository.findById(dto.requestId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy yêu cầu"));

        if (request.getStatus() != RequestStatus.VERIFIED) {
            throw new RuntimeException("Yêu cầu chưa được xác minh");
        }

        RescueTeam team = teamRepository.findById(dto.teamId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đội cứu hộ phù hợp"));

        if (team.getStatus() == RescueTeam.TeamStatus.INACTIVE) {
            throw new RuntimeException("Đội cứu hộ hiện không hoạt động!");
        }

        request.setAssignedTeam(team);
        request.setStatus(RequestStatus.ASSIGNED);

        team.setStatus(RescueTeam.TeamStatus.ON_DUTY);
        requestRepository.save(request);
        teamRepository.save(team);
    }

}
