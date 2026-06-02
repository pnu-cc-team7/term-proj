package com.team7.termproject.auth.kakao;

public interface KakaoUserClient {

    KakaoUser getUser(String accessToken);
}

