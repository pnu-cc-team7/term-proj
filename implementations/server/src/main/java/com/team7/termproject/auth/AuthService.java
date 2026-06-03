package com.team7.termproject.auth;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.team7.termproject.auth.kakao.KakaoApiClient;
import com.team7.termproject.auth.kakao.KakaoUser;
import com.team7.termproject.user.ServiceUser;
import com.team7.termproject.user.UserRepository;

@Service
public class AuthService {

    private final KakaoApiClient kakaoApiClient;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthService(
            KakaoApiClient kakaoApiClient,
            UserRepository userRepository,
            JwtTokenProvider jwtTokenProvider
    ) {
        this.kakaoApiClient = kakaoApiClient;
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    public AuthResult authenticateWithKakao(String code) {
        if (!StringUtils.hasText(code)) {
            throw new AccessTokenRequiredException();
        }

        // 1. 인가 코드를 액세스 토큰으로 교환
        String accessToken = kakaoApiClient.getToken(code.trim());

        // 2. 액세스 토큰으로 사용자 정보 조회
        KakaoUser kakaoUser = kakaoApiClient.getUser(accessToken);

        // 3. 서비스 사용자 처리 및 JWT 발급
        ServiceUser user = userRepository.findOrCreateByKakaoId(kakaoUser.id());
        String jwt = jwtTokenProvider.createToken(user);

        return new AuthResult(user, jwt);
    }
}
