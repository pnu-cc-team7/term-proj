package com.team7.termproject.user;

import java.time.Instant;

public record ServiceUser(String id, String kakaoId, Instant createdAt) {
}

