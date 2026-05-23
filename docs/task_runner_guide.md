# 태스크 러너(Makefile) 사용 가이드

우리 프로젝트에서는 복잡한 터미널 명령어를 일일이 외우지 않고, 짧은 별칭으로 간편하게 실행할 수 있도록 **`Makefile`**을 도입했습니다. 

---

## 1. 주요 명령어 안내

프로젝트 루트 폴더에서 다음과 같이 입력해 보세요.

### ① 도움말 확인 (`make help` 또는 `make`)
사용 가능한 명령어 목록을 보여줍니다.
```bash
make help
```

### ② API 코드 자동 생성 (`make api-gen`)
가장 자주 쓰게 될 명령어입니다. `specs/api/openapi.yaml` 설계도를 읽어서 프론트엔드와 백엔드용 코드를 자동으로 만들어줍니다.
- **대화형 선택**: 명령어를 실행하면 어떤 언어로 생성할지 선택할 수 있습니다.
- **목록 확인**: 전체 Generator 목록은 `make list-generators`로 확인할 수 있습니다.
- **권장 환경**: Docker가 설치되어 있으면 가장 깔끔하게 실행됩니다.
```bash
make api-gen
```

### ③ 정리하기 (`make clean`)
자동으로 생성된 파일들을 지우고 싶을 때 사용합니다.
```bash
make clean
```

---

## 2. 운영체제별 준비 사항 (Docker 권장)
`make api-gen` 명령어는 Docker를 사용하여 실행되도록 설정되어 있습니다. 
- Docker가 설치되어 있지 않다면, [API 생성 가이드](openapi_guide.md)를 참고하여 `pip`나 `npm`으로 직접 도구를 설치해서 사용할 수도 있습니다.

막히는 부분이 있으면 `docs/openapi_guide.md`와 `make list-generators`부터 확인하면 됩니다.
