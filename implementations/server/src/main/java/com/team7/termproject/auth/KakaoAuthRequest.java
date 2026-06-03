package com.team7.termproject.auth;

import jakarta.validation.constraints.NotBlank;

public record KakaoAuthRequest(@NotBlank String code) {
}

