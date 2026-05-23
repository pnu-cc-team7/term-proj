# Team 7 텀 프로젝트: 음식점 소셜 투표 프로젝트 (가칭)

부산대학교 클라우드컴퓨팅 텀 프로젝트 7팀의 저장소입니다.

---

## 프로젝트 구조 가이드

- **`specs/`**: 우리 프로젝트의 설계도가 담긴 곳입니다.
    - `specs/api/openapi.yaml`: 모든 API의 약속이 담겨 있습니다. 수정이 필요하면 팀원과 상의 후 이 파일을 직접 수정합니다.
- **`docs/`**: 사용 가이드가 담긴 곳입니다.
    - [웰컴 가이드](docs/welcome_guide.md): 프로젝트 철학 및 역할 안내
    - [API 생성 가이드](docs/openapi_guide.md): 자동 코드 생성 방법
    - [태스크 러너 가이드](docs/task_runner_guide.md): `make` 명령어 사용법
- **`implementations/`**: 실제 구현 코드가 들어가는 공간입니다.

---

## 빠른 시작 3단계

1. **웰컴 가이드 확인**: [웰컴 가이드](docs/welcome_guide.md)를 통해 팀의 기본 방향을 이해합니다.
2. **명세 확인**: `specs/api/openapi.yaml` 파일을 열어 우리가 어떤 기능을 만들기로 했는지 살펴봅니다.
3. **개발 시작**: `make api-gen` 명령어로 통신 코드를 자동 생성하고 바로 개발에 착수합니다.

---

## 주요 공유 링크

- [노션 전체 프로젝트 페이지](https://www.notion.so/mindulle/35e4abe3a8af80b7a40cda23bdc769c3?source=copy_link)
- [이벤트 스토밍 화이트보드](https://draw.sonagi.space/shared/e60be180-9751-4423-afdd-c1987b49ee2c)
- [기능 명세서 페이지](https://docs.google.com/spreadsheets/d/12i0c0IIqc_yO-0Ai3gJ10BGVoQv9I4vG4cb787onXi4/edit?usp=sharing)
- [프로토타입 페이지](https://term-proj.proto.sonagi.space/)
