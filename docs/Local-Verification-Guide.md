# 🧪 로컬 검증 및 개발 가이드 (Local Verification Guide)

오늘 우리가 겪은 시행착오(빌드 오류, 인프라 한도 초과 등)를 방지하고, 더 빠르고 안전하게 개발하기 위한 가이드입니다. **배포 버튼을 누르기 전, 반드시 로컬에서 먼저 확인하는 습관을 가집시다.**

---

## 1. 로컬 통합 테스트 환경 구축

배포 환경은 하루 사용량이 정해져 있습니다. 실제 서버에 올리기 전, 아래 순서로 로컬에서 모든 기능을 확인하세요.

### **A. 백엔드 실행 (Native Java)**
Java 17이 설치되어 있어야 합니다.
```bash
cd implementations/server
./gradlew bootRun
```
*   **체크포인트**: `Started TermprojectApplication` 메시지가 뜨고 8080 포트가 열렸는지 확인.

### **B. 프론트엔드 실행 (Hybrid Mode)**
프론트엔드는 현재 로그인은 실제 백엔드와, 나머지는 모킹(MSW)과 통신하는 **하이브리드 모드**를 지원합니다.
```bash
cd implementations/client
# .env.local 설정 (VITE_ENABLE_MOCKING=true 권장)
npm run dev
```
*   **체크포인트**: 브라우저에서 `localhost:5173` 접속 시 지도가 뜨고 투표 목록이 보이는지 확인.

---

## 2. 배포 전 필수 체크리스트 (Pre-Deployment Checklist)

단순한 실수로 배포가 실패하는 것을 막기 위해 **푸시 전 딱 2가지만** 직접 실행해 보세요.

1.  **빌드 테스트 (Build Check)**:
    ```bash
    cd implementations/client && npm run build
    cd implementations/server && ./gradlew build -x test
    ```
    *   *이것만 해도 `...` 같은 오타나 문법 에러로 인한 배포 실패를 100% 막을 수 있습니다.*

2.  **자동화 검증 (E2E Test)**:
    Playwright를 사용하여 실제 브라우저 흐름을 확인하세요.
    ```bash
    cd implementations/client
    npx playwright test  # (또는 우리가 만든 커스텀 스크립트 실행)
    ```

---

## 3. 하이브리드 모드 활용법 (Hybrid Mocking)

우리는 백엔드 구현 속도와 상관없이 프론트엔드를 개발하기 위해 하이브리드 모드를 사용합니다.

*   **로그인(Auth)**: 무조건 실제 백엔드(`8080`)와 통신합니다. (카카오 SDK 필요)
*   **나머지 API**: `VITE_ENABLE_MOCKING=true`일 때 MSW가 가짜 데이터를 줍니다.
*   **전환 방법**: 특정 API를 실제 서버와 붙이고 싶다면, `src/mocks/handlers.ts`에서 해당 핸들러를 **주석 처리**하거나 삭제하세요. MSW가 처리하지 않는 요청은 자동으로 실제 서버로 흘러갑니다.

---

## 4. 인프라 절약 가이드 (Azure Quota)

우리가 사용하는 Azure 무료 티어(F1)는 소중합니다.
*   **배포 횟수 조절**: 하루에 빌드/배포는 **3~5회 이내**로 제한하는 것이 좋습니다.
*   **리셋 시간**: 사용량 한도는 매일 **오전 9시(KST)**에 초기화됩니다. 
*   **상태 확인**: `az webapp show` 명령어나 Azure 포털에서 `QuotaExceeded` 상태인지 가끔 확인하세요.

---

**"로컬에서 완벽하면, 서버에서도 완벽합니다."** 🚀
오늘의 기록을 바탕으로 더 견고한 팀 프로젝트를 만들어 나갑시다!
