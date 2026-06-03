package com.team7.termproject.auth;

import org.springframework.http.HttpStatus;

import com.team7.termproject.common.ApiException;

public class AccessTokenRequiredException extends ApiException {

    public AccessTokenRequiredException() {
        super(HttpStatus.BAD_REQUEST, "ACCESS_TOKEN_REQUIRED", "accessToken is required");
    }
}

