package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.request.CreateRescueRequestDTO;
import com.floodrescue.floodrescuesystem.dto.response.ApiResponse;
import com.floodrescue.floodrescuesystem.dto.response.RescueRequestResponse;
import com.floodrescue.floodrescuesystem.service.RescueRequestService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/rescue-requests")
@CrossOrigin(origins = "*", maxAge = 3600)
public class RescueRequestController {

    @Autowired
    private RescueRequestService rescueRequestService;

    /**
     * Tạo yêu cầu cứu hộ mới
     * POST /api/rescue-requests
     */
    @PostMapping
    public ResponseEntity<ApiResponse<RescueRequestResponse>> createRescueRequest(
            @Valid @RequestBody CreateRescueRequestDTO requestDTO,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        RescueRequestResponse response = rescueRequestService.createRescueRequest(userId, requestDTO);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(new ApiResponse<>(
                        true,
                        "Tạo yêu cầu cứu hộ thành công",
                        response
                ));
    }

    /**
     * Lấy danh sách tất cả yêu cầu cứu hộ
     * GET /api/rescue-requests
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<RescueRequestResponse>>> getAllRescueRequests() {
        List<RescueRequestResponse> responses = rescueRequestService.getAllRescueRequests();

        return ResponseEntity.ok(new ApiResponse<>(
                true,
                "Lấy danh sách yêu cầu cứu hộ thành công",
                responses
        ));
    }
}
