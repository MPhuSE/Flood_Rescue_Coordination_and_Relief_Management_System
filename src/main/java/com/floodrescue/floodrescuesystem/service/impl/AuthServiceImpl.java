package com.floodrescue.floodrescuesystem.service.impl;

import com.floodrescue.floodrescuesystem.dto.request.LoginRequest;
import com.floodrescue.floodrescuesystem.dto.request.RefreshTokenRequest;
import com.floodrescue.floodrescuesystem.dto.request.RegisterRequest;
import com.floodrescue.floodrescuesystem.dto.response.AuthResponse;
import com.floodrescue.floodrescuesystem.entity.RefreshToken;
import com.floodrescue.floodrescuesystem.entity.Role;
import com.floodrescue.floodrescuesystem.entity.User;
import com.floodrescue.floodrescuesystem.exception.BadRequestException;
import com.floodrescue.floodrescuesystem.exception.ResourceNotFoundException;
import com.floodrescue.floodrescuesystem.exception.UnauthorizedException;
import com.floodrescue.floodrescuesystem.repository.RefreshTokenRepository;
import com.floodrescue.floodrescuesystem.repository.RoleRepository;
import com.floodrescue.floodrescuesystem.repository.UserRepository;
import com.floodrescue.floodrescuesystem.security.JwtService;
import com.floodrescue.floodrescuesystem.service.AuthService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.jwt.refresh-expiration}")
    private long refreshExpiration;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }
        if (request.getEmail() != null && !request.getEmail().isBlank() && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName("CITIZEN")
                .orElseThrow(() -> new ResourceNotFoundException("Default role CITIZEN not found"));

        User user = new User();
        user.setFullName(request.getFullName());
        user.setUsername(request.getUsername());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setStatus("ACTIVE");
        user.setRole(role);

        User savedUser = userRepository.save(user);
        return buildAuthResponse("Register success", savedUser, true);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        user.setLastLoginAt(LocalDateTime.now());
        User savedUser = userRepository.save(user);
        return buildAuthResponse("Login success", savedUser, true);
    }

    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken storedToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new UnauthorizedException("Refresh token not found"));

        if (Boolean.TRUE.equals(storedToken.getRevoked())) {
            throw new UnauthorizedException("Refresh token has been revoked");
        }

        if (storedToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new UnauthorizedException("Refresh token has expired");
        }

        User user = storedToken.getUser();
        String accessToken = jwtService.generateAccessToken(user);
        return new AuthResponse("Refresh token success", accessToken, storedToken.getToken());
    }

    private AuthResponse buildAuthResponse(String message, User user, boolean rotateRefreshToken) {
        String accessToken = jwtService.generateAccessToken(user);
        String refreshTokenValue = jwtService.generateRefreshToken(user);

        if (rotateRefreshToken) {
            refreshTokenRepository.deleteByUser(user);

            RefreshToken refreshToken = new RefreshToken();
            refreshToken.setToken(refreshTokenValue);
            refreshToken.setUser(user);
            refreshToken.setRevoked(false);
            refreshToken.setExpiresAt(LocalDateTime.now().plusNanos(refreshExpiration * 1_000_000L));
            refreshTokenRepository.save(refreshToken);
        }

        return new AuthResponse(message, accessToken, refreshTokenValue);
    }
}
