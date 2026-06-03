# 🍽️ Gourmet Social (Team 7)

본 프로젝트는 **지능형 맛집 투표 플랫폼**입니다.  
클라우드 네이티브 아키텍처를 활용하여 실시간성 및 확장성을 확보하는 것을 목표로 합니다.

---

## 🚀 라이브 서비스 및 문서 (Quick Links)

| 항목 | 링크 | 비고 |
| :--- | :--- | :--- |
| 💻 **Frontend (Production)** | [접속하기](https://ashy-ocean-0e6441b00.7.azurestaticapps.net) | Azure Static Web Apps |
| ⚙️ **Backend API (Production)** | [접속하기](http://app-term-proj-team7-server.azurewebsites.net) | Azure App Service |
| 🧪 **Staging Server** | [접속하기](http://pnu-team7-stage.duckdns.org) | Oracle Cloud (통합 테스트용) |
| 📜 **API Documentation** | [인터랙티브 문서](https://pnu-cc-team7.github.io/term-proj/) | Swagger UI (GitHub Pages) |

---

## 🛠️ 개발 가이드

### 1. API 클라이언트 및 문서 생성
저장소 루트에 위치한 `Makefile`을 통해 필요한 도구를 실행할 수 있습니다.
```bash
# API 명세를 기반으로 예쁜 HTML 문서 생성 (docs/api/index.html)
make gen-docs

# 프론트엔드용 TypeScript Axios SDK 생성
make api-gen  # 실행 후 1번 선택
```

### 2. 기술 스택
- **Auth**: 카카오 OAuth 2.0 (JWT + Http-Only Cookie)
- **Map**: 카카오 지도 SDK (Kakao Maps API)
- **Database**: Azure SQL Database (Serverless)
- **Infra**: Azure PaaS (App Service, Static Web Apps)
- **CI/CD**: GitHub Actions (Auto Deploy on Push to `main`)

---

## ☁️ 인프라 및 모니터링
상세한 인프라 구성 및 접속 정보는 [docs/INFRA.md](./docs/INFRA.md)를 참고하세요.

---

## 📈 프로젝트 상태 및 기록

- **[변경 이력 (Changelog)](./CHANGELOG.md)**: 전체 마일스톤 및 릴리즈 노트 📝
- **[로컬 검증 가이드](./docs/Local-Verification-Guide.md)**: 배포 전 필수 확인 절차 🧪

---
*Created by Team 7 Master Orchestrator*
