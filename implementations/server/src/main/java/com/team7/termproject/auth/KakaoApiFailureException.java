package com.team7.termproject.auth;

import org.springframework.http.HttpStatus;

import com.team7.termproject.common.ApiException;

public class KakaoApiFailureException extends ApiException {

    public KakaoApiFailureException(Throwable cause) {
        super(HttpStatus.BAD_GATEWAY, "KAKAO_API_ERROR", "Kakao API verification failed", cause);
    }
}

