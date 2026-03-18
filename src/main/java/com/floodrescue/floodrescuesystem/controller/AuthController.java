package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.request.LoginRequest;
import com.floodrescue.floodrescuesystem.dto.request.RefreshTokenRequest;
import com.floodrescue.floodrescuesystem.dto.request.RegisterRequest;
import com.floodrescue.floodrescuesystem.dto.response.ApiResponse;
import com.floodrescue.floodrescuesystem.dto.response.AuthResponse;
import com.floodrescue.floodrescuesystem.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ApiResponse.success("Register success", authService.register(request));
    }

    @PostMapping("/login")
    public ApiResponse<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.success("Login success", authService.login(request));
    }

    @PostMapping("/refresh")
    public ApiResponse<AuthResponse> refreshToken(@Valid @RequestBody RefreshTokenRequest request) {
        return ApiResponse.success("Refresh token success", authService.refreshToken(request));
    }
}
