package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.request.CreateRescueRequestDTO;
import com.floodrescue.floodrescuesystem.dto.request.VerifyRescueRequestDTO;
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
                                .body(ApiResponse.success("Tạo yêu cầu cứu hộ thành công", response));
        }

        /**
         * Lấy danh sách tất cả yêu cầu cứu hộ
         * GET /api/rescue-requests
         */
        @GetMapping
        public ResponseEntity<ApiResponse<List<RescueRequestResponse>>> getAllRescueRequests() {
                List<RescueRequestResponse> responses = rescueRequestService.getAllRescueRequests();

                return ResponseEntity.ok(ApiResponse.success("Lấy danh sách yêu cầu cứu hộ thành công", responses));
        }

        /**
         * Xem thông tin chi tiết một yêu cầu cứu hộ theo ID
         * GET /api/rescue-requests/{id}
         */
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> getRescueRequestById(@PathVariable Long id) {
                RescueRequestResponse response = rescueRequestService.getRescueRequestById(id);

                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin chi tiết thành công", response));
        }

        /**
         * Lấy danh sách yêu cầu của một người dùng cụ thể
         * GET /api/rescue-requests/user/{userId}
         */
        @GetMapping("/user/{userId}")
        public ResponseEntity<ApiResponse<List<RescueRequestResponse>>> getUserRequests(@PathVariable Long userId) {
                List<RescueRequestResponse> responses = rescueRequestService.getUserRescueRequests(userId);

                return ResponseEntity
                                .ok(ApiResponse.success("Lấy danh sách yêu cầu của người dùng thành công", responses));
        }

        /**
         * Cập nhật trạng thái yêu cầu cứu hộ
         * PATCH /api/rescue-requests/{id}/status?status=COMPLETED
         */
        @PatchMapping("/{id}/status")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> updateStatus(
                        @PathVariable Long id,
                        @RequestParam String status) {

                RescueRequestResponse response = rescueRequestService.updateRescueRequestStatus(id, status);

                return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", response));
        }

        /**
         * Giao yêu cầu cứu hộ cho một đội
         * POST /api/rescue-requests/{id}/assign/{teamId}
         */
        @PostMapping("/{id}/assign/{teamId}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> assignToTeam(
                        @PathVariable Long id,
                        @PathVariable Long teamId) {

                RescueRequestResponse response = rescueRequestService.assignRescueRequestToTeam(id, teamId);

                return ResponseEntity.ok(ApiResponse.success("Giao đội cứu hộ thành công", response));
        }

        /**
         * Cập nhật thông tin yêu cầu (Sửa mô tả, vị trí...)
         * PUT /api/rescue-requests/{id}
         */
        @PutMapping("/{id}")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> updateRequest(
                        @PathVariable Long id,
                        @Valid @RequestBody CreateRescueRequestDTO requestDTO) {

                RescueRequestResponse response = rescueRequestService.updateRescueRequest(id, requestDTO);

                return ResponseEntity.ok(ApiResponse.success("Cập nhật yêu cầu thành công", response));
        }

        /**
         * Xác minh yêu cầu cứu hộ (duyệt hoặc từ chối)
         * PATCH /api/rescue-requests/{id}/verify
         */
        @PatchMapping("/{id}/verify")
        public ResponseEntity<ApiResponse<RescueRequestResponse>> verifyRescueRequest(
                        @PathVariable Long id,
                        @Valid @RequestBody VerifyRescueRequestDTO verifyDTO) {

                RescueRequestResponse response = rescueRequestService.verifyRescueRequest(id, verifyDTO);

                String message = verifyDTO.getApproved()
                                ? "Xác minh yêu cầu cứu hộ thành công"
                                : "Từ chối yêu cầu cứu hộ thành công";

                return ResponseEntity.ok(ApiResponse.success(message, response));
        }

        /**
         * Xóa yêu cầu cứu hộ
         * DELETE /api/rescue-requests/{id}
         */
        @DeleteMapping("/{id}")
        public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
                rescueRequestService.deleteRescueRequest(id);

                return ResponseEntity.ok(ApiResponse.success("Xóa yêu cầu thành công", null));
        }
}