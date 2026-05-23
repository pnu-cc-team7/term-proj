# 📚 주요 OpenAPI Generator 가이드

OpenAPI Generator는 수백 개의 언어와 프레임워크를 지원합니다. 우리 팀원들이 주로 사용할 만한 **추천 제네레이터**들을 정리해 보았습니다. 본인의 기술 스택에 맞는 이름을 찾아보세요!

---

## 1. 프론트엔드 (Web / Mobile)

| 제네레이터 이름 | 추천 환경 | 특징 |
| :--- | :--- | :--- |
| **`typescript-axios`** | React, Vue, Next.js | **[강력 추천]** 가장 널리 쓰이며, Axios를 사용해 직관적인 API 호출 코드를 만들어줍니다. |
| **`typescript-fetch`** | 현대적인 브라우저 환경 | 별도의 라이브러리 없이 브라우저 내장 `fetch` API를 사용합니다. |
| **`dart-dio`** | Flutter | Flutter에서 가장 인기 있는 `Dio` 패키지 기반의 코드를 생성합니다. |
| **`swift5`** | iOS (Native) | Swift 5 표준 라이브러리와 Combine 등을 지원합니다. |

---

## 2. 백엔드 (Server Interface)

백엔드에서는 주로 **인터페이스(Interface)와 모델(DTO)**만 생성하여 비즈니스 로직에 집중하는 방식을 추천합니다.

| 제네레이터 이름 | 추천 환경 | 특징 |
| :--- | :--- | :--- |
| **`spring`** | Java (Spring Boot) | **[강력 추천]** 컨트롤러 인터페이스와 DTO를 생성합니다. `interfaceOnly=true` 옵션을 권장합니다. |
| **`typescript-nestjs`** | NestJS | NestJS 스타일의 컨트롤러와 서비스 인터페이스를 만들어줍니다. |
| **`go-server`** | Go (Golang) | `net/http`나 `chi` 기반의 서버 뼈대를 생성합니다. |
| **`python-fastapi`** | Python | 현대적인 FastAPI 프레임워크용 코드를 생성합니다. |

---

## 💡 제네레이터 선택 팁

1.  **커뮤니티 지원**: 가급적 많은 사람이 사용하는 제네레이터(예: `typescript-axios`, `spring`)를 선택하는 것이 좋습니다. 버그가 적고 레퍼런스가 많기 때문입니다.
2.  **버전 확인**: 특정 제네레이터는 `typeVersion`이나 `library` 옵션에 따라 결과물이 크게 달라질 수 있습니다. 상세한 설정이 필요하면 [공식 문서](https://openapi-generator.tech/docs/generators)를 참고해 보세요.
3.  **검색 방법**: 터미널에서 `make api-gen` 후 **5번**을 누르면 전체 목록을 볼 수 있습니다. `ctrl+f`로 본인의 언어를 검색해 보세요.

---

## 🛠️ 내가 원하는 게 목록에 없다면?

만약 본인이 사용하려는 언어나 프레임워크가 위 표에 없다면, [공식 지원 목록](https://openapi-generator.tech/docs/generators)에서 찾아보거나 팀장에게 문의해 주세요. 대부분의 현대적인 언어는 모두 지원하고 있습니다!
