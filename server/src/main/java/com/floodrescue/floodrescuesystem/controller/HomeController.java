package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public ApiResponse<Map<String, String>> home() {
        return ApiResponse.success(
                "Flood Rescue API is running",
                Map.of(
                        "auth", "/api/auth/login, /api/auth/register, /api/auth/refresh",
                        "profile", "/api/users/me (requires Bearer token)"
                )
        );
    }
}
