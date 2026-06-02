package com.team7.termproject.auth;

import org.springframework.http.HttpStatus;

import com.team7.termproject.common.ApiException;

public class InvalidKakaoTokenException extends ApiException {

    public InvalidKakaoTokenException() {
        super(HttpStatus.UNAUTHORIZED, "INVALID_KAKAO_TOKEN", "Invalid Kakao access token");
    }
}

