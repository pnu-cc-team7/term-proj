package com.team7.termproject.user;

public interface UserRepository {

    ServiceUser findOrCreateByKakaoId(String kakaoId);
}

