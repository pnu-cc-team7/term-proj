# 🛠️ Team 7: Backend Development Guide (Azure App Service)

이 가이드는 **Azure App Service**를 활용하여 백엔드를 개발하고 배포하기 위한 공통 지침입니다. 
우리 팀은 **Agnostic Architecture**를 지향하므로, 담당 개발자는 자신의 생산성이 가장 높은 언어와 프레임워크를 선택할 수 있습니다.

---

## 🏗️ 지원되는 기술 스택 (Azure Runtimes)
Azure App Service는 다음을 포함한 다양한 환경을 공식 지원합니다:
- **Node.js** (Express, NestJS 등)
- **Python** (FastAPI, Flask, Django 등)
- **Go**, **Java**, **PHP**, **.NET** 등

---

## 📂 권장 프로젝트 구조 (Common)

```text
root/
├── .github/workflows/      # Azure 자동 배포 설정 (CI/CD)
├── src/                    # 비즈니스 로직 소스 코드
├── specs/                  # [중요] openapi.yaml (Contract)
├── .env.example            # 환경 변수 설정 가이드
├── [Dependency File]       # package.json, requirements.txt, go.mod 등
└── [Entry Point]           # server.js, main.py, app.go 등
```

---

## 🚀 Azure 배포 핵심 조건

### 1. 포트(Port) 바인딩
Azure App Service는 환경 변수(`PORT`)를 통해 수신 포트를 지정합니다. 선택한 언어의 서버 설정에서 이를 반드시 읽어와야 합니다.
- **Node.js**: `process.env.PORT`
- **Python**: `os.environ.get("PORT")`

### 2. GitHub Actions 자동화
어떤 언어를 선택하든, Azure 포털에서 제공하는 워크플로우 템플릿을 사용하여 `main` 브랜치 Push 시 자동 배포되도록 설정합니다.

---

## 🔐 핵심 로직 구현 지침 (카카오 로그인 검증)

언어와 상관없이 다음 프로세스를 준수해야 합니다:
1. **Token Verification**: FE에서 전달받은 `accessToken`을 카카오 API(`v2/user/me`)로 전송하여 사용자 정보 검증.
2. **Session Management**: 우리 서비스만의 JWT를 발급하여 **Http-Only Cookie**로 클라이언트에 전달.
3. **Security**: 쿠키 설정 시 `Secure`, `SameSite=None` 옵션을 필수 적용 (CORS 및 HTTPS 대응).

---

## 💡 백엔드 팀원 가이드
1. **기술 선택**: 팀 내 공유 후 자유롭게 언어/프레임워크 선택.
2. **Contract 준수**: 반드시 `specs/api/openapi.yaml`에 정의된 규격을 지킬 것.
3. **배포 환경**: 인프라 리드(**혜성님**)가 구축한 Azure App Service 환경에 맞게 환경변수 및 포트 설정 확인.
