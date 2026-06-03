package com.team7.termproject.auth;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.team7.termproject.auth.kakao.KakaoUser;
import com.team7.termproject.auth.kakao.KakaoUserClient;
import com.team7.termproject.user.ServiceUser;
import com.team7.termproject.user.UserRepository;

@Service
public class AuthService {

    private final KakaoUserClient kakaoUserClient;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            KakaoUserClient kakaoUserClient,
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.kakaoUserClient = kakaoUserClient;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResult authenticateWithKakao(String accessToken) {
        if (!StringUtils.hasText(accessToken)) {
            throw new AccessTokenRequiredException();
        }

        KakaoUser kakaoUser = kakaoUserClient.getUser(accessToken.trim());
        ServiceUser user = userRepository.findOrCreateByKakaoId(kakaoUser.id());
        String jwt = jwtTokenProvider.createToken(user);

        return new AuthResult(user, jwt);
    }
}

