package com.floodrescue.floodrescuesystem.service.impl;

import com.floodrescue.floodrescuesystem.dto.response.UserProfileResponse;
import com.floodrescue.floodrescuesystem.entity.User;
import com.floodrescue.floodrescuesystem.exception.ResourceNotFoundException;
import com.floodrescue.floodrescuesystem.repository.UserRepository;
import com.floodrescue.floodrescuesystem.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserProfileResponse getCurrentUserProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserProfileResponse.fromUser(user);
    }
}
