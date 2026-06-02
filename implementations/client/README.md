# 🎨 Gourmet Social Frontend (Client)

이 폴더는 **Gourmet Social** 프로젝트의 프론트엔드 소스 코드를 담고 있습니다.  
프로토타입의 '종이와 연필' 디자인 시스템이 적용되어 있으며, 모바일 웹 환경에 최적화되어 있습니다.

## 🚀 시작하기

### 1. 의존성 설치 및 실행
```bash
npm install
npm run dev
```

### 2. 환경 변수 설정
`.env.example` 파일을 복사하여 `.env` 파일을 생성하고, 필요한 API 키를 입력해 주세요.
- `VITE_API_BASE_URL`: 백엔드 서버 주소 (기본값 설정됨)
- `VITE_KAKAO_MAP_KEY`: 카카오 지도 JavaScript 키

## 🖋️ 디자인 시스템 (Design System)

우리 프로젝트는 **프로토타입의 '종이와 연필' 테마**를 반영한 독특한 UI를 사용합니다.

### 디자인 토큰 (CSS Variables)
`src/index.css`에 정의된 변수들을 자유롭게 활용하세요.
- 컬러: `var(--paper)`, `var(--ink)`, `var(--accent)`, `var(--highlight)` 등
- 폰트: `var(--serif)` (제목), `var(--hand)` (본문/손글씨)

### 공통 컴포넌트
`src/components/common/`에 구현된 컴포넌트들을 사용하여 일관성을 유지해 주세요.
- `SketchButton`: 굵은 테두리의 버튼
- `StickyNote`: 포스트잇 스타일의 정보 박스
- `PlaceCard`: 음식점 정보를 보여주는 카드

## 🔌 API 통신 (OpenAPI SDK)

`src/api/` 폴더에는 OpenAPI Spec을 기반으로 자동 생성된 SDK가 들어있습니다.
직접 `fetch`나 `axios` 요청을 짤 필요 없이, 생성된 API 클래스를 사용하세요.

```typescript
import { VoteApi } from './api';

const voteApi = new VoteApi();
const votes = await voteApi.votesGet();
```

---
*Created by Team 7 Frontend Lead*
