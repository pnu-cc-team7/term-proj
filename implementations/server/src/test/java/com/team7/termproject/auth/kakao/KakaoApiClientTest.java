package com.team7.termproject.auth.kakao;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.header;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withServerError;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;

import com.team7.termproject.auth.InvalidKakaoTokenException;
import com.team7.termproject.auth.KakaoApiFailureException;
import com.team7.termproject.config.AppProperties;

class KakaoApiClientTest {

    private static final String USER_ME_URL = "https://kapi.kakao.com/v2/user/me";

    private RestTemplate restTemplate;
    private MockRestServiceServer server;
    private KakaoApiClient client;

    @BeforeEach
    void setUp() {
        restTemplate = new RestTemplate();
        server = MockRestServiceServer.bindTo(restTemplate).build();
        client = new KakaoApiClient(restTemplate, properties());
    }

    @Test
    void callsKakaoUserMeWithBearerAccessToken() {
        server.expect(requestTo(USER_ME_URL))
                .andExpect(method(HttpMethod.GET))
                .andExpect(header("Authorization", "Bearer kakao-access-token"))
                .andRespond(withSuccess("""
                        {"id":987654321}
                        """, MediaType.APPLICATION_JSON));

        KakaoUser user = client.getUser("kakao-access-token");

        assertThat(user.id()).isEqualTo("987654321");
        server.verify();
    }

    @Test
    void mapsKakaoClientErrorToInvalidToken() {
        server.expect(requestTo(USER_ME_URL))
                .andRespond(withStatus(HttpStatus.UNAUTHORIZED));

        assertThatThrownBy(() -> client.getUser("bad-token"))
                .isInstanceOf(InvalidKakaoTokenException.class);
        server.verify();
    }

    @Test
    void mapsKakaoServerErrorToUpstreamFailure() {
        server.expect(requestTo(USER_ME_URL))
                .andRespond(withServerError());

        assertThatThrownBy(() -> client.getUser("valid-token"))
                .isInstanceOf(KakaoApiFailureException.class);
        server.verify();
    }

    private AppProperties properties() {
        return new AppProperties(
                new AppProperties.Cors("http://localhost:5173"),
                new AppProperties.Jwt(
                        "12345678901234567890123456789012",
                        3600,
                        "token",
                        "term-proj-api"
                ),
                new AppProperties.Kakao(USER_ME_URL)
        );
    }
}

