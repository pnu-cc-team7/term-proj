# ☁️ Infrastructure Guide (Azure)

본 프로젝트는 비용 최적화 및 안정적인 시연을 위해 **Azure PaaS(Platform as a Service)** 환경을 사용합니다. 모든 리소스는 **East Asia (홍콩)** 지역에 구축되어 있습니다.

## 1. 배포 환경 정보

| 구성 요소 | 리소스 이름 | 배포 URL (Production) | 비고 |
| :--- | :--- | :--- | :--- |
| **Frontend** | `stapp-term-proj-team7` | [https://ashy-ocean-0e6441b00.7.azurestaticapps.net](https://ashy-ocean-0e6441b00.7.azurestaticapps.net) | Azure Static Web Apps (Free) |
| **Backend** | `app-term-proj-team7-server` | [http://app-term-proj-team7-server.azurewebsites.net](http://app-term-proj-team7-server.azurewebsites.net) | Azure App Service (Java 17, F1) |
| **Database** | `sql-term-proj-team7-asia` | `sql-term-proj-team7-asia.database.windows.net` | Azure SQL DB (Serverless) |

## 2. 데이터베이스 접속 정보
- **서버**: `sql-term-proj-team7-asia.database.windows.net`
- **DB명**: `db-term-proj-team7`
- **사용자**: `team7admin`
- **비밀번호**: GitHub Secrets (`SPRING_DATASOURCE_PASSWORD`) 참고
- **보안**: 모든 Azure 서비스 및 팀원 로컬 IP에서의 접속을 허용하도록 방화벽 설정됨.

## 3. CI/CD 파이프라인 (GitHub Actions)
- **워크플로우**: `.github/workflows/deploy-app.yml`
- **트리거**: `main` 브랜치 푸시 시 자동 실행
- **검증**: 빌드 전 프론트엔드(`npm test`) 및 백엔드 유닛 테스트 자동 수행

## 4. 환경 변수 (GitHub Secrets)
배포 및 런타임에 필요한 주요 설정값들이 관리되고 있습니다.
- `AZURE_CREDENTIALS`: Azure RBAC 인증 정보
- `SPRING_DATASOURCE_URL`: SQL 연결 문자열
- `AZURE_STATIC_WEB_APPS_API_TOKEN`: 프론트엔드 배포 토큰

---
*Last Updated: 2026-06-03 (Updated with SQL DB & Region info)*
