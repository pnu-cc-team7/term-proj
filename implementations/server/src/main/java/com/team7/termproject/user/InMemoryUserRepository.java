package com.team7.termproject.user;

import java.time.Instant;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.springframework.stereotype.Repository;

@Repository
public class InMemoryUserRepository implements UserRepository {

    private final ConcurrentMap<String, ServiceUser> usersByKakaoId = new ConcurrentHashMap<>();

    @Override
    public ServiceUser findOrCreateByKakaoId(String kakaoId) {
        return usersByKakaoId.computeIfAbsent(kakaoId, key ->
                new ServiceUser("kakao:" + key, key, Instant.now())
        );
    }
}

