package com.team7.termproject.config;

import java.util.Arrays;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record AppProperties(Cors cors, Jwt jwt, Kakao kakao) {

    public record Cors(String origins) {

        public List<String> originList() {
            return Arrays.stream(origins.split(","))
                    .map(String::trim)
                    .filter(origin -> !origin.isBlank())
                    .toList();
        }
    }

    public record Jwt(
            String secret,
            long expiresInSeconds,
            String cookieName,
            String issuer
    ) {
    }

    public record Kakao(
            String userMeUrl,
            String tokenUrl,
            String clientId,
            String redirectUri
    ) {
    }
}

