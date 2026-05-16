package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.request.CreateShelterRequest;
import com.floodrescue.floodrescuesystem.dto.response.ApiResponse;
import com.floodrescue.floodrescuesystem.dto.response.ShelterResponse;
import com.floodrescue.floodrescuesystem.service.ShelterService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shelters")
public class ShelterController {

    private final ShelterService shelterService;

    public ShelterController(ShelterService shelterService) {
        this.shelterService = shelterService;
    }

    @GetMapping
    public ApiResponse<List<ShelterResponse>> getAllShelters() {
        return ApiResponse.success("Fetched all shelters", shelterService.getAllShelters());
    }

    @GetMapping("/{id}")
    public ApiResponse<ShelterResponse> getShelterById(@PathVariable Long id) {
        return ApiResponse.success("Fetched shelter", shelterService.getShelterById(id));
    }

    @PostMapping
    public ApiResponse<ShelterResponse> createShelter(@Valid @RequestBody CreateShelterRequest request) {
        return ApiResponse.success("Created shelter", shelterService.createShelter(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<ShelterResponse> updateShelter(@PathVariable Long id, @Valid @RequestBody CreateShelterRequest request) {
        return ApiResponse.success("Updated shelter", shelterService.updateShelter(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteShelter(@PathVariable Long id) {
        shelterService.deleteShelter(id);
        return ApiResponse.success("Deleted shelter", null);
    }
}
