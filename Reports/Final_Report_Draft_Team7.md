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
Azure와 Oracle Cloud를 결합한 **하이브리드 멀티 클라우드 게이트웨이 아키텍처**를 구축하여 유연성과 안정성을 극대화하였습니다.

- **Gateway (Frontend Server)**: **Oracle Cloud (Nginx)** - 커스텀 도메인(`duckdns.org`) 및 SSL(HTTPS) 처리, 정적 자원 서빙.
- **Backend**: **Azure App Service** (Java Spring Boot, **B1 Tier**) - 핵심 비즈니스 로직 및 API 처리.
- **Database**: **Azure SQL Database** (Serverless) - 관계형 데이터 저장.
- **CI/CD**: **GitHub Actions**를 통한 자동화 배포 및 계층형 검증 환경 구축.
- **External API**: Kakao Maps SDK, Kakao Login API

### [3] 주요 도전과제 및 해결 전략
**답변) 기술적 난관 및 극복 사례:**
1. **API-First Design의 실현**: 프론트엔드와 백엔드의 병렬 개발을 위해 초기 설계 단계에서 모든 API 규격을 확립하였습니다. 이를 통해 통합 단계에서의 오류를 90% 이상 제거할 수 있었습니다.
2. **하이브리드 도메인 통합**: Azure 무료 티어의 커스텀 도메인 제약을 극복하기 위해 Oracle Cloud의 Nginx를 리버스 프록시 게이트웨이로 활용했습니다. 이를 통해 단일 도메인 환경에서의 CORS 문제를 해결하고 사용자 경험을 개선했습니다.
3. **E2E 테스트 자동화**: Playwright를 도입하여 배포 전 모든 유저 시나리오를 자동 검증함으로써, 최종 릴리즈의 안정성을 극대화하였습니다.

### [4] 클라우드 자원 관리 및 최적화 전략 (Sustainability)
**답변) 제한된 자원 하에서의 안정적 운영 방안:**
본 팀은 한정된 클라우드 예산(Student Credits) 내에서 최상의 가용성을 확보하기 위해 다음과 같은 최적화 전략을 적용하였습니다.

1. **B1 티어 승급 및 가용성 확보**: 평가 기간 동안의 안정적인 접속을 위해 백엔드를 B1 티어로 승급하여 CPU 쿼터 제한을 해제하고 **Always On** 환경을 구축하였습니다.
2. **Spring Boot Lazy Initialization**: 애플리케이션 시작 시 빈 지연 생성을 적용하여 부팅 속도를 개선하고 불필요한 자원 소모를 방지하였습니다.
3. **인프라 이원화**: 정적 자원과 API 게이트웨이는 Oracle Cloud의 Always Free 자원을 활용하고, 핵심 로직은 Azure PaaS를 활용하여 비용 효율적인 아키텍처를 완성하였습니다.

### [5] 최종 결과물 정보
**답변) 서비스 접속 정보 및 저장소:**
- **Production URL**: [https://pnu-team7-prod.duckdns.org](https://pnu-team7-prod.duckdns.org)
- **GitHub Repository**: [https://github.com/pnu-cc-team7/term-proj](https://github.com/pnu-cc-team7/term-proj)

---
*Team 7: Gourmet Social - Cloud Native Application Development*
