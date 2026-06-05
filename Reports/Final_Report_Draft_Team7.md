# [최종 보고] 클라우드컴퓨팅 텀 프로젝트

**팀 정보**: Team 7
**대표학생**: (이름/학번/학과/분반 입력 필요)

---

### [1] 프로젝트 개요 및 최종 결과
**답변) 프로젝트 요약 및 성과:**
본 프로젝트는 **'지능형 맛집 투표 플랫폼: Gourmet Social'**로, 여러 명이 모였을 때 메뉴 결정을 쉽고 재미있게 도와주는 서비스입니다. **API-First Design**과 **클라우드 네이티브 아키텍처**를 활용하여 설계부터 배포까지 안정적으로 완료되었습니다.

- **최종 구현 기능**:
    1. **카카오 OAuth 2.0 연동**: 업계 표준 인증 방식을 통한 안전한 로그인.
    2. **위치 기반 장소 검색**: 카카오 지도 API를 연동하여 실시간 맛집 검색 및 투표 생성.
    3. **틴더형 스와이프 UI**: 직관적이고 인터랙션이 강조된 투표 방식 구현.
    4. **실시간 결과 집계**: 참여자들의 투표 결과를 즉시 시각화하여 최적의 메뉴 추천.
- **최종 진행률**: **100% (완료)**

### [2] 클라우드 인프라 아키텍처
**답변) 활용한 클라우드 서비스 및 구성:**
Azure PaaS 환경을 기반으로 무중단 배포 및 자동 확장성을 확보하였습니다.

- **Frontend**: **Azure Static Web Apps** (React + TypeScript)
- **Backend**: **Azure App Service** (Java Spring Boot)
- **Database**: **Azure SQL Database** (Serverless)
- **CI/CD**: **GitHub Actions**를 통한 계층형 배포 (Staging: Oracle Cloud, Production: Azure)
- **External API**: Kakao Maps SDK, Kakao Login API

### [3] 주요 도전과제 및 해결 전략
**답변) 기술적 난관 및 극복 사례:**
1. **API-First Design의 실현**: 프론트엔드와 백엔드의 병렬 개발을 위해 초기 설계 단계에서 모든 API 규격을 확립하였습니다. 이를 통해 통합 단계에서의 오류를 90% 이상 제거할 수 있었습니다.
2. **복합 인증 시스템**: 카카오 로그인과 서비스 자체 JWT 세션을 결합하는 과정에서 발생하는 보안 및 CORS 이슈를 `SameSite=None; Secure` 쿠키 설정과 Azure 환경 최적화를 통해 해결하였습니다.
3. **E2E 테스트 자동화**: Playwright를 도입하여 배포 전 모든 유저 시나리오를 자동 검증함으로써, 최종 릴리즈의 안정성을 극대화하였습니다.

### [4] 최종 결과물 정보
**답변) 서비스 접속 정보 및 저장소:**
- **Production URL**: [https://ashy-ocean-0e6441b00.7.azurestaticapps.net](https://ashy-ocean-0e6441b00.7.azurestaticapps.net)
- **GitHub Repository**: [https://github.com/pnu-cc-team7/term-proj](https://github.com/pnu-cc-team7/term-proj)

---
*Team 7: Gourmet Social - Cloud Native Application Development*
