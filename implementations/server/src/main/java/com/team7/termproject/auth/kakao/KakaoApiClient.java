package com.team7.termproject.auth.kakao;

import java.util.List;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.team7.termproject.auth.InvalidKakaoTokenException;
import com.team7.termproject.auth.KakaoApiFailureException;
import com.team7.termproject.config.AppProperties;

@Component
public class KakaoApiClient implements KakaoUserClient {

    private final RestTemplate restTemplate;
    private final AppProperties properties;

    public KakaoApiClient(RestTemplate restTemplate, AppProperties properties) {
        this.restTemplate = restTemplate;
        this.properties = properties;
    }

    @Override
    public KakaoUser getUser(String accessToken) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setAccept(List.of(MediaType.APPLICATION_JSON));

        try {
            ResponseEntity<KakaoUserMeResponse> response = restTemplate.exchange(
                    properties.kakao().userMeUrl(),
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    KakaoUserMeResponse.class
            );

            KakaoUserMeResponse body = response.getBody();
            if (body == null || body.id() == null) {
                throw new InvalidKakaoTokenException();
            }

            return new KakaoUser(String.valueOf(body.id()));
        } catch (HttpClientErrorException exception) {
            throw new InvalidKakaoTokenException();
        } catch (ResourceAccessException exception) {
            throw new KakaoApiFailureException(exception);
        } catch (RestClientException exception) {
            throw new KakaoApiFailureException(exception);
        }
    }

    public String getToken(String code) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", properties.kakao().clientId());
        params.add("redirect_uri", properties.kakao().redirectUri());
        params.add("code", code);

        try {
            ResponseEntity<KakaoTokenResponse> response = restTemplate.postForEntity(
                    properties.kakao().tokenUrl(),
                    new HttpEntity<>(params, headers),
                    KakaoTokenResponse.class
            );

            KakaoTokenResponse body = response.getBody();
            if (body == null || body.access_token() == null) {
                throw new InvalidKakaoTokenException();
            }

            return body.access_token();
        } catch (HttpClientErrorException exception) {
            throw new InvalidKakaoTokenException();
        } catch (RestClientException exception) {
            throw new KakaoApiFailureException(exception);
        }
    }

    private record KakaoUserMeResponse(Long id) {
    }

    private record KakaoTokenResponse(String access_token) {
    }
}

