package com.floodrescue.floodrescuesystem.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

/**
 * Service quản lý blacklist JWT token bằng Redis.
 * Khi user logout, access token sẽ được thêm vào blacklist
 * với TTL = thời gian còn lại của token.
 */
@Service
public class TokenBlacklistService {

    private static final String BLACKLIST_PREFIX = "blacklist:token:";

    private final RedisTemplate<String, Object> redisTemplate;

    public TokenBlacklistService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * Thêm token vào blacklist.
     *
     * @param token       JWT token cần blacklist
     * @param expirationMs thời gian tồn tại còn lại của token (milliseconds)
     */
    public void blacklistToken(String token, long expirationMs) {
        String key = BLACKLIST_PREFIX + token;
        redisTemplate.opsForValue().set(key, "blacklisted", expirationMs, TimeUnit.MILLISECONDS);
    }

    /**
     * Kiểm tra token có bị blacklist hay không.
     *
     * @param token JWT token cần kiểm tra
     * @return true nếu token đã bị blacklist
     */
    public boolean isBlacklisted(String token) {
        String key = BLACKLIST_PREFIX + token;
        return Boolean.TRUE.equals(redisTemplate.hasKey(key));
    }
}
