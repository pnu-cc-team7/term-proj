# ☁️ 부산대학교 클라우드 컴퓨팅 텀 프로젝트 (Team 7)

본 프로젝트는 **거지맵(Beggar Map)** 역기획을 기반으로 한 **지능형 맛집 투표 플랫폼**입니다.
클라우드 네이티브 아키텍처를 활용하여 실시간성 및 확장성을 확보하는 것을 목표로 합니다.

---

## 🚀 빠른 시작 (Quick Start)

### 1. API 명세 확인 (필독)
모든 개발의 기준은 아래 실시간 API 문서입니다. 기획 변경 시 자동으로 업데이트됩니다.
- 🌐 **실시간 API 문서**: [https://pnu-cc-team7.github.io/term-proj/](https://pnu-cc-team7.github.io/term-proj/)

### 2. 기술 스택 (최종)
- **인증**: 카카오 OAuth 2.0 (JWT + Http-Only Cookie)
- **지도**: 카카오 지도 SDK (Kakao Maps API)
- **인프라**: Azure App Service & Static Web Apps (PaaS 중심)
- **백엔드**: 자유 (OpenAPI 명세 준수 필수)
- **프론트엔드**: TypeScript Axios SDK (Auto-generated)

---

## 🛠️ 개발 가이드

### API 클라이언트 및 문서 생성
저장소 루트에 위치한 `Makefile`을 통해 필요한 도구를 실행할 수 있습니다.
```bash
# API 명세를 기반으로 예쁜 HTML 문서 생성 (docs/api/index.html)
make gen-docs

# 프론트엔드용 TypeScript Axios SDK 생성
make api-gen  # 실행 후 1번 선택
```

### 배포 파이프라인 (CI/CD)
- **GitHub main 브랜치**에 코드를 Push하면 Azure에 자동으로 배포됩니다.
- 인프라 환경은 Azure PaaS 기반으로 구축되어 있습니다.

---
*Created by Team 7 Master Orchestrator*
