package com.team7.termproject.auth;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.team7.termproject.config.AppProperties;
import com.team7.termproject.user.ServiceUser;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenProvider {

    private final AppProperties properties;
    private final SecretKey key;

    public JwtTokenProvider(AppProperties properties) {
        String secret = properties.jwt().secret();
        if (!StringUtils.hasText(secret)) {
            throw new IllegalStateException("JWT_SECRET is required");
        }

        byte[] secretBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (secretBytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET must be at least 32 bytes for HS256");
        }

        this.properties = properties;
        this.key = Keys.hmacShaKeyFor(secretBytes);
    }

    public String createToken(ServiceUser user) {
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(properties.jwt().expiresInSeconds());

        return Jwts.builder()
                .subject(user.id())
                .issuer(properties.jwt().issuer())
                .claim("kakaoId", user.kakaoId())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(key, Jwts.SIG.HS256)
                .compact();
    }

    public String getKakaoId(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get("kakaoId", String.class);
    }
}

