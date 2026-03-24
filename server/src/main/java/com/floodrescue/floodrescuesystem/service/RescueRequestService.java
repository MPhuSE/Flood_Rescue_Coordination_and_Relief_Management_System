package com.floodrescue.floodrescuesystem.service;

import com.floodrescue.floodrescuesystem.dto.request.CreateRescueRequestDTO;
import com.floodrescue.floodrescuesystem.dto.response.RescueRequestResponse;
import com.floodrescue.floodrescuesystem.entity.*;
import com.floodrescue.floodrescuesystem.exception.BadRequestException;
import com.floodrescue.floodrescuesystem.exception.ResourceNotFoundException;
import com.floodrescue.floodrescuesystem.repository.RescueRequestRepository;
import com.floodrescue.floodrescuesystem.repository.RescueTeamRepository;
import com.floodrescue.floodrescuesystem.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RescueRequestService {

    @Autowired
    private RescueRequestRepository rescueRequestRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RescueTeamRepository rescueTeamRepository;

    /**
     * Tạo yêu cầu cứu hộ mới
     */
    @Transactional
    public RescueRequestResponse createRescueRequest(Long userId, CreateRescueRequestDTO requestDTO) {
        // Kiểm tra người dùng tồn tại
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        // Validate dữ liệu
        if (requestDTO.getDescription() == null || requestDTO.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Mô tả yêu cầu không được để trống");
        }
        if (requestDTO.getLocation() == null || requestDTO.getLocation().trim().isEmpty()) {
            throw new BadRequestException("Địa điểm không được để trống");
        }
        if (requestDTO.getLatitude() == null) {
            throw new BadRequestException("Vĩ độ không được để trống");
        }
        if (requestDTO.getLongitude() == null) {
            throw new BadRequestException("Kinh độ không được để trống");
        }
        if (requestDTO.getUrgencyLevel() == null || requestDTO.getUrgencyLevel().trim().isEmpty()) {
            throw new BadRequestException("Mức độ khẩn cấp không được để trống");
        }

        // Parse urgency level
        UrgencyLevel urgencyLevel;
        try {
            urgencyLevel = UrgencyLevel.valueOf(requestDTO.getUrgencyLevel().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Mức độ khẩn cấp không hợp lệ. Vui lòng sử dụng: LOW, MEDIUM, HIGH, CRITICAL");
        }

        // Tạo rescue request mới
        RescueRequest rescueRequest = new RescueRequest(
                user,
                requestDTO.getDescription(),
                requestDTO.getLocation(),
                requestDTO.getLatitude(),
                requestDTO.getLongitude(),
                requestDTO.getImage(),
                urgencyLevel);

        // Lưu vào database
        RescueRequest savedRequest = rescueRequestRepository.save(rescueRequest);

        return mapToResponse(savedRequest);
    }

    /**
     * Lấy tất cả yêu cầu cứu hộ
     */
    public List<RescueRequestResponse> getAllRescueRequests() {
        List<RescueRequest> requests = rescueRequestRepository.findAll();
        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tìm kiếm yêu cầu cứu hộ theo ID
     */
    public RescueRequestResponse getRescueRequestById(Long requestId) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu cứu hộ không tồn tại với ID: " + requestId));

        return mapToResponse(rescueRequest);
    }

    /**
     * Lấy tất cả yêu cầu cứu hộ của một người dùng
     */
    public List<RescueRequestResponse> getUserRescueRequests(Long userId) {
        // Kiểm tra người dùng tồn tại
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại với ID: " + userId));

        List<RescueRequest> requests = rescueRequestRepository.findByUserId(userId);
        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy tất cả yêu cầu cứu hộ có trạng thái nhất định
     */
    public List<RescueRequestResponse> getRescueRequestsByStatus(String status) {
        RequestStatus requestStatus;
        try {
            requestStatus = RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái không hợp lệ");
        }

        List<RescueRequest> requests = rescueRequestRepository.findByStatus(requestStatus);
        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Giao yêu cầu cứu hộ cho đội cứu hộ
     */
    @Transactional
    public RescueRequestResponse assignRescueRequestToTeam(Long requestId, Long teamId) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu cứu hộ không tồn tại với ID: " + requestId));

        RescueTeam rescueTeam = rescueTeamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Đội cứu hộ không tồn tại với ID: " + teamId));

        rescueRequest.setAssignedTeam(rescueTeam);
        rescueRequest.setStatus(RequestStatus.ASSIGNED);
        rescueRequest.setUpdatedTime(LocalDateTime.now());

        RescueRequest updatedRequest = rescueRequestRepository.save(rescueRequest);
        return mapToResponse(updatedRequest);
    }

    /**
     * Cập nhật trạng thái yêu cầu cứu hộ
     */
    @Transactional
    public RescueRequestResponse updateRescueRequestStatus(Long requestId, String status) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu cứu hộ không tồn tại với ID: " + requestId));

        RequestStatus requestStatus;
        try {
            requestStatus = RequestStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Trạng thái không hợp lệ");
        }

        rescueRequest.setStatus(requestStatus);
        rescueRequest.setUpdatedTime(LocalDateTime.now());

        RescueRequest updatedRequest = rescueRequestRepository.save(rescueRequest);
        return mapToResponse(updatedRequest);
    }

    /**
     * Cập nhật yêu cầu cứu hộ
     */
    @Transactional
    public RescueRequestResponse updateRescueRequest(Long requestId, CreateRescueRequestDTO requestDTO) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu cứu hộ không tồn tại với ID: " + requestId));

        if (requestDTO.getDescription() != null) {
            rescueRequest.setDescription(requestDTO.getDescription());
        }
        if (requestDTO.getLocation() != null) {
            rescueRequest.setLocation(requestDTO.getLocation());
        }
        if (requestDTO.getLatitude() != null) {
            rescueRequest.setLatitude(requestDTO.getLatitude());
        }
        if (requestDTO.getLongitude() != null) {
            rescueRequest.setLongitude(requestDTO.getLongitude());
        }
        if (requestDTO.getImage() != null) {
            rescueRequest.setImage(requestDTO.getImage());
        }
        if (requestDTO.getUrgencyLevel() != null) {
            try {
                rescueRequest.setUrgencyLevel(UrgencyLevel.valueOf(requestDTO.getUrgencyLevel().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Mức độ khẩn cấp không hợp lệ");
            }
        }

        rescueRequest.setUpdatedTime(LocalDateTime.now());
        RescueRequest updatedRequest = rescueRequestRepository.save(rescueRequest);
        return mapToResponse(updatedRequest);
    }

    /**
     * Xóa yêu cầu cứu hộ
     */
    @Transactional
    public void deleteRescueRequest(Long requestId) {
        RescueRequest rescueRequest = rescueRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Yêu cầu cứu hộ không tồn tại với ID: " + requestId));

        rescueRequestRepository.delete(rescueRequest);
    }

    /**
     * Lấy tất cả yêu cầu cứu hộ được giao cho một đội
     */
    public List<RescueRequestResponse> getRescueRequestsByTeam(Long teamId) {
        rescueTeamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Đội cứu hộ không tồn tại với ID: " + teamId));

        List<RescueRequest> requests = rescueRequestRepository.findByAssignedTeamTeamId(teamId);
        return requests.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Chuyển đổi RescueRequest entity sang RescueRequestResponse DTO
     */
    private RescueRequestResponse mapToResponse(RescueRequest rescueRequest) {
        RescueRequestResponse response = new RescueRequestResponse();
        response.setRequestId(rescueRequest.getRequestId());
        response.setUserId(rescueRequest.getUser().getId());
        response.setUserName(rescueRequest.getUser().getFullName());
        response.setDescription(rescueRequest.getDescription());
        response.setLocation(rescueRequest.getLocation());
        response.setLatitude(rescueRequest.getLatitude());
        response.setLongitude(rescueRequest.getLongitude());
        response.setImage(rescueRequest.getImage());
        response.setUrgencyLevel(rescueRequest.getUrgencyLevel());
        response.setStatus(rescueRequest.getStatus());
        response.setCreatedTime(rescueRequest.getCreatedTime());
        response.setUpdatedTime(rescueRequest.getUpdatedTime());

        if (rescueRequest.getAssignedTeam() != null) {
            response.setAssignedTeamId(rescueRequest.getAssignedTeam().getTeamId());
            response.setAssignedTeamName(rescueRequest.getAssignedTeam().getTeamName());
        }

        response.setNotes(rescueRequest.getNotes());
        return response;
    }
}