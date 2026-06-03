package com.team7.termproject.auth;

import com.team7.termproject.user.ServiceUser;

public record AuthResponse(UserResponse user) {

    public static AuthResponse from(ServiceUser user) {
        return new AuthResponse(new UserResponse(user.id(), user.kakaoId()));
    }

    public record UserResponse(String id, String kakaoId) {
    }
}

