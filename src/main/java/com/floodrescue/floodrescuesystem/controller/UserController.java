package com.floodrescue.floodrescuesystem.controller;

import com.floodrescue.floodrescuesystem.dto.response.ApiResponse;
import com.floodrescue.floodrescuesystem.dto.response.UserProfileResponse;
import com.floodrescue.floodrescuesystem.service.UserService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getMyProfile(Authentication authentication) {
        return ApiResponse.success(
                "User profile retrieved successfully",
                userService.getCurrentUserProfile(authentication.getName())
        );
    }
}
