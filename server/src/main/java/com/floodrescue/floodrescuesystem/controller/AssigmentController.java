package com.floodrescue.floodrescuesystem.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.floodrescue.floodrescuesystem.dto.request.AssignTeamRequestDTO;
import com.floodrescue.floodrescuesystem.service.AssignmentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
public class AssigmentController {
    private final AssignmentService assgimentService;

    @PostMapping("/assign")
    public ResponseEntity<String> AssignTeam(@RequestBody AssignTeamRequestDTO dto) {
        assgimentService.AssignTeam(dto);
        return ResponseEntity.ok("Đã gán đội cứu hộ thành công!");
    }
}
