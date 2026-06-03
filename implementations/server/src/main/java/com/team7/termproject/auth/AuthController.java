package com.team7.termproject.auth;

import java.time.Duration;

import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team7.termproject.config.AppProperties;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final AppProperties properties;

    public AuthController(AuthService authService, AppProperties properties) {
        this.authService = authService;
        this.properties = properties;
    }

    @PostMapping("/kakao")
    public ResponseEntity<AuthResponse> loginWithKakao(@Valid @RequestBody KakaoAuthRequest request) {
        AuthResult result = authService.authenticateWithKakao(request.code());
        ResponseCookie cookie = ResponseCookie.from(properties.jwt().cookieName(), result.jwt())
                .httpOnly(true)
                .secure(true)
                .sameSite("None")
                .path("/")
                .maxAge(Duration.ofSeconds(properties.jwt().expiresInSeconds()))
                .build();

        return ResponseEntity
                .ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(AuthResponse.from(result.user()));
    }
}

