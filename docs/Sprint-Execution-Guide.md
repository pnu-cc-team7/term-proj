# 🚀 클라우드 컴퓨팅 텀프로젝트: 최종 스프린트 실행 가이드 (Azure 에디션)

**마감 기한: 2026년 6월 7일 (일)**
**핵심 목표: 카카오 연동 지도 기반 맛집 투표 서비스 완성**

---

## 1. 역할 분담 및 주요 태스크

### 🎨 프론트엔드 (혜성님) - 프로젝트 리딩 및 인프라 조정
- **인프라 총괄**: Azure App Service 및 Static Web Apps 환경 구축 (No-Docker).
- **SDK 통합**: 카카오 지도 + 카카오 로그인 SDK 연동.
- **핵심 UI**: 틴더형 스와이프/월드컵 UI 및 결과 페이지.

### ⚙️ 백엔드 A (인증 & 세션)
- **카카오 OAuth 서버**: 카카오 토큰 검증 및 서비스 JWT 발급 로직.
- **GitHub 배포**: Hoofo가 세팅한 Azure 환경에 코드 Push로 즉시 배포.

### ⚙️ 백엔드 B (비즈니스 로직)
- **API 개발**: 투표 목록, 참여, 결과 조회 API.
- **DB 연동**: Azure SQL 또는 호환 가능한 DB 연동 작업.

---

## 2. ☁️ 인프라 전략: Azure PaaS (No-Docker)
팀원들의 개발 편의를 위해 복잡한 Docker 설정 없이 **코드 기반 배포**를 수행합니다.

- **Backend**: **Azure App Service** (GitHub `main` 브랜치 Push 시 자동 배포).
- **Frontend**: **Azure Static Web Apps**.
- **Database**: **Azure SQL Database** 또는 관리형 서비스.

---

## 3. 📅 최종 일정
- **6/1 (월)**: Azure 인프라 세팅 완료 및 기본 지도 UI 구현.
- **6/3 (수)**: 백엔드 API 1차 통합 (인증/투표).
- **6/5 (금)**: 최종 기능 테스트 및 배포 안정화.
- **6/7 (일)**: 최종 보고서 제출.

---
## 💡 문서 동기화 완료 (2026-05-30)
- **Azure 최적화**: 모든 AWS/Lambda 레퍼런스를 Azure App Service/Functions로 교체 완료.
- **MVP 동결**: `Beggar-Map-Master-Feature-List.md` 및 Google Sheets(`Functional Spec`)를 MVP 기능 5개로 한정하여 동결.
- **API 계약**: `final_openapi.yaml`에 투표 상태(`status`) 필드를 추가하여 기능 명세와 싱크 완료.
- **GitHub 동기화**: `pnu-cc-team7/term-proj` 저장소의 `specs/` 구조와 일치 확인.
