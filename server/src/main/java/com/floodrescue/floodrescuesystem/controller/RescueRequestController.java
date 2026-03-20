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
                                                response));
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
                                responses));
        }

        /**
         * Lấy chi tiết yêu cầu cứu hộ theo ID
         */
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> getRescueRequestById(@PathVariable Long id) {
                RescueRequestResponse response = rescueRequestService.getRescueRequestById(id);
                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chi tiết thành công", response));
        }

        /**
         * Cập nhật trạng thái yêu cầu cứu hộ
         */
        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> updateStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {
                RescueRequestResponse response = rescueRequestService.updateRescueRequestStatus(id, status);
                return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", response));
        }

        /**
         * Giao yêu cầu cứu hộ cho đội
         */
        @PostMapping("/{id}/assign/{teamId}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> assignToTeam(
                        @PathVariable Long id,
                        @PathVariable Long teamId) {
                RescueRequestResponse response = rescueRequestService.assignRescueRequestToTeam(id, teamId);
                return ResponseEntity.ok(ApiResponse.success("Giao đội cứu hộ thành công", response));
        }

        /**
         * Cập nhật thông tin yêu cầu cứu hộ
         */
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> updateRescueRequest(
                        @PathVariable Long id,
                        @Valid @RequestBody CreateRescueRequestDTO requestDTO) {
                RescueRequestResponse response = rescueRequestService.updateRescueRequest(id, requestDTO);
                return ResponseEntity.ok(ApiResponse.success("Cập nhật yêu cầu thành công", response));
        }

        /**
         * Xóa yêu cầu cứu hộ
         */
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteRescueRequest(@PathVariable Long id) {
                rescueRequestService.deleteRescueRequest(id);
                return ResponseEntity.ok(ApiResponse.success("Xóa yêu cầu thành công", null));
        }

        /**
         * Lấy danh sách yêu cầu cứu hộ của một người dùng cụ thể
         */
        @GetMapping("/user/{userId}")
        public ResponseEntity<ApiResponse<List<RescueRequestResponse>>> getUserRequests(@PathVariable Long userId) {
                List<RescueRequestResponse> responses = rescueRequestService.getUserRescueRequests(userId);
                return ResponseEntity
                                .ok(ApiResponse.success("Lấy danh sách yêu cầu của người dùng thành công", responses));
        }
}