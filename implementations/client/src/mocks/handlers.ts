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
          { id: 'opt1', name: '김치찌개', kakao_id: '12345' },
          { id: 'opt2', name: '돈까스', kakao_id: '67890' }
        ]
      },
      {
        id: '2',
        title: '이번 주 팀 회식 장소',
        status: 'open',
        options: [
          { id: 'opt3', name: '삼겹살', kakao_id: '11111' },
          { id: 'opt4', name: '회', kakao_id: '22222' }
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
