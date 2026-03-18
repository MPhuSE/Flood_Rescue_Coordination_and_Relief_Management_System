package com.floodrescue.floodrescuesystem.service;

import com.floodrescue.floodrescuesystem.dto.response.UserProfileResponse;

public interface UserService {

    UserProfileResponse getCurrentUserProfile(String username);
}
