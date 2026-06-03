package com.team7.termproject.auth;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.Instant;

import javax.crypto.SecretKey;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.team7.termproject.auth.kakao.KakaoUser;
import com.team7.termproject.auth.kakao.KakaoUserClient;
import com.team7.termproject.user.ServiceUser;
import com.team7.termproject.user.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@SpringBootTest(properties = {
        "app.jwt.secret=12345678901234567890123456789012",
        "app.jwt.expires-in-seconds=3600",
        "app.jwt.cookie-name=token",
        "app.jwt.issuer=term-proj-api",
        "app.cors.origins=http://localhost:5173",
        "app.kakao.user-me-url=https://kapi.kakao.com/v2/user/me"
})
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final String JWT_SECRET = "12345678901234567890123456789012";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private KakaoUserClient kakaoUserClient;

    @MockBean
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        when(kakaoUserClient.getUser("valid-kakao-token"))
                .thenReturn(new KakaoUser("123456789"));
        when(userRepository.findOrCreateByKakaoId("123456789"))
                .thenReturn(new ServiceUser(
                        "kakao:123456789",
                        "123456789",
                        Instant.parse("2026-05-31T00:00:00Z")
                ));
    }

    @Test
    void issuesJwtCookieForValidKakaoAccessToken() throws Exception {
        MvcResult result = mockMvc.perform(post("/auth/kakao")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accessToken":"valid-kakao-token"}
                                """))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("token=")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("HttpOnly")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Secure")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("SameSite=None")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Path=/")))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, containsString("Max-Age=3600")))
                .andExpect(jsonPath("$.user.id").value("kakao:123456789"))
                .andExpect(jsonPath("$.user.kakaoId").value("123456789"))
                .andReturn();

        String setCookie = result.getResponse().getHeader(HttpHeaders.SET_COOKIE);
        String jwt = setCookie.substring("token=".length(), setCookie.indexOf(';'));
        Claims claims = parseClaims(jwt);

        assertThat(claims.getSubject()).isEqualTo("kakao:123456789");
        assertThat(claims.getIssuer()).isEqualTo("term-proj-api");
        assertThat(claims.get("kakaoId")).isEqualTo("123456789");
    }

    @Test
    void returnsBadRequestWhenAccessTokenIsMissing() throws Exception {
        mockMvc.perform(post("/auth/kakao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest())
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.error.code").value("ACCESS_TOKEN_REQUIRED"))
                .andExpect(jsonPath("$.error.message").value("accessToken is required"));
    }

    @Test
    void returnsUnauthorizedWhenKakaoTokenVerificationFails() throws Exception {
        when(kakaoUserClient.getUser("bad-token"))
                .thenThrow(new InvalidKakaoTokenException());

        mockMvc.perform(post("/auth/kakao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accessToken":"bad-token"}
                                """))
                .andExpect(status().isUnauthorized())
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.error.code").value("INVALID_KAKAO_TOKEN"))
                .andExpect(jsonPath("$.error.message").value("Invalid Kakao access token"));
    }

    @Test
    void returnsInternalServerErrorWhenUnexpectedErrorOccurs() throws Exception {
        when(userRepository.findOrCreateByKakaoId("123456789"))
                .thenThrow(new RuntimeException("database is down"));

        mockMvc.perform(post("/auth/kakao")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"accessToken":"valid-kakao-token"}
                                """))
                .andExpect(status().isInternalServerError())
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE))
                .andExpect(jsonPath("$.error.code").value("INTERNAL_SERVER_ERROR"))
                .andExpect(jsonPath("$.error.message").value("Internal server error"));
    }

    private Claims parseClaims(String token) {
        SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(UTF_8));
        return Jwts.parser()
                .verifyWith(key)
                .requireIssuer("term-proj-api")
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

