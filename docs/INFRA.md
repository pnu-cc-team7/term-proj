# ☁️ Infrastructure Guide (Azure)

본 프로젝트는 비용 최적화 및 안정적인 시연을 위해 **Azure PaaS(Platform as a Service)** 환경을 사용합니다.

## 1. 배포 환경 정보

| 구성 요소 | 리소스 이름 | 배포 URL (Production) | 비고 |
| :--- | :--- | :--- | :--- |
| **Frontend** | `stapp-term-proj-team7` | [https://ashy-ocean-0e6441b00.7.azurestaticapps.net](https://ashy-ocean-0e6441b00.7.azurestaticapps.net) | Azure Static Web Apps (Free SKU) |
| **Backend** | `app-term-proj-team7-server` | [https://app-term-proj-team7-server.azurewebsites.net](https://app-term-proj-team7-server.azurewebsites.net) | Azure App Service (F1 Free Plan) |
| **Resource Group** | `rg-term-proj-team7` | - | East Asia (홍콩) 지역 |

## 2. CI/CD 파이프라인 (GitHub Actions)
- **대상 브랜치**: `main`
- **동작**: `implementations/` 하위 폴더 내 변경사항 발생 시 자동 빌드 및 배포
- **워크플로우**: `.github/workflows/deploy-app.yml`

## 3. 비용 정책 (Cost Management)
- 현재 모든 리소스는 **무료(Free/F1) 계층**으로 설정되어 있습니다.
- **Student 크레딧 소모**: 없음 (단, 성능 이슈 시 B1으로 업그레이드 고려 가능)
- **주의**: App Service(F1)는 일정 시간 요청이 없으면 Idle 상태로 전환되어 첫 요청이 느릴 수 있습니다.

## 4. 환경 변수 (Secrets)
- 배포를 위해 아래 Secrets가 GitHub Repository에 등록되어 있습니다.
    - `AZURE_STATIC_WEB_APPS_API_TOKEN`: 프론트엔드 배포용

---
*Last Updated: 2026-05-30*
