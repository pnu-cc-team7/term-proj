import { http, HttpResponse } from 'msw'

export const handlers = [
  // 1. 투표 목록 조회 모킹
  http.get('/votes', () => {
    const savedVotes = localStorage.getItem('gourmet_votes')
    const votes = savedVotes ? JSON.parse(savedVotes) : [
      {
        id: '1',
        title: '오늘 점심 뭐 먹을까?',
        status: 'open',
        options: [
          { id: 'opt1', name: '김치찌개 맛집', kakao_id: '12345', lat: 35.2315, lng: 129.0841 },
          { id: 'opt2', name: '부산대 돈까스', kakao_id: '67890', lat: 35.2300, lng: 129.0825 }
        ]
      }
    ]
    return HttpResponse.json(votes)
  }),

  // 2. 투표 생성 모킹
  http.post('/votes', async ({ request }) => {
    const newVote = await request.json() as any
    const savedVotes = localStorage.getItem('gourmet_votes')
    const votes = savedVotes ? JSON.parse(savedVotes) : []
    
    const voteWithId = {
      ...newVote,
      id: Date.now().toString(),
      status: 'open',
      options: newVote.options.map((opt: any, i: number) => ({
        ...opt,
        id: `opt-${Date.now()}-${i}`
      }))
    }
    
    localStorage.setItem('gourmet_votes', JSON.stringify([voteWithId, ...votes]))
    return HttpResponse.json(voteWithId, { status: 201 })
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
