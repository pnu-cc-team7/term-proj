import { http, HttpResponse } from 'msw'

export const handlers = [
  // 1. 투표 목록 조회 모킹
  http.get('/votes', () => {
    return HttpResponse.json([
      {
        id: '1',
        title: '오늘 점심 뭐 먹을까?',
        status: 'open',
        options: [
          { id: 'opt1', name: '김치찌개 맛집', kakao_id: '12345', lat: 35.2315, lng: 129.0841 },
          { id: 'opt2', name: '부산대 돈까스', kakao_id: '67890', lat: 35.2300, lng: 129.0825 }
        ]
      },
      {
        id: '2',
        title: '이번 주 팀 회식 장소',
        status: 'open',
        options: [
          { id: 'opt3', name: '정문 삼겹살', kakao_id: '11111', lat: 35.2325, lng: 129.0855 },
          { id: 'opt4', name: '북문 회센터', kakao_id: '22222', lat: 35.2350, lng: 129.0810 }
        ]
      }
    ])
  }),

  // 2. 카카오 로그인 모킹
  http.post('/auth/kakao', () => {
    return new HttpResponse(null, {
      status: 200,
      headers: {
        'Set-Cookie': 'token=mocked-jwt-token; HttpOnly; Path=/;'
      }
    })
  }),

  // 3. 투표 결과 조회 모킹
  http.get('/votes/:id/results', () => {
    return HttpResponse.json({
      totalVotes: 15,
      options: [
        { optionId: 'opt1', name: '김치찌개', count: 10 },
        { optionId: 'opt2', name: '돈까스', count: 5 }
      ]
    })
  })
]
