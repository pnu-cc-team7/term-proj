import { useState, useEffect } from 'react'
import './App.css'
import { SketchButton, StickyNote } from './components/common'
import { SwipeVoteCard } from './components/vote/SwipeVoteCard'
import { KakaoMap } from './components/vote/KakaoMap'
import { VoteList } from './components/vote/VoteList'
import axios from 'axios'

// API 설정
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

console.log('--- App Init ---', { 
  baseURL: axios.defaults.baseURL, 
  mocking: import.meta.env.VITE_ENABLE_MOCKING,
  keyExists: !!import.meta.env.VITE_KAKAO_MAP_KEY 
});

declare global {
  interface Window {
    kakao: any;
    Kakao: any;
  }
}

interface VoteOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

interface Vote {
  id: string;
  title: string;
  status: string;
  options: VoteOption[];
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null)
  const [resultsData, setResultsData] = useState<any>(null)

  // 투표 생성 상태
  const [newVoteTitle, setNewVoteTitle] = useState('')
  const [newVoteOptions, setNewVoteOptions] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])

  // 장소 검색 함수
  const searchPlaces = () => {
    if (!searchKeyword.trim() || !window.kakao || !window.kakao.maps.services) return;
    
    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(searchKeyword, (data: any, status: any) => {
      if (status === window.kakao.maps.services.Status.OK) {
        setSearchResults(data);
      } else {
        alert('No results found.');
      }
    });
  }

  const addOption = (place: any) => {
    if (newVoteOptions.find(opt => opt.kakao_id === place.id)) {
      alert('Already added!');
      return;
    }
    setNewVoteOptions([...newVoteOptions, { 
      name: place.place_name, 
      lat: parseFloat(place.y), 
      lng: parseFloat(place.x), 
      kakao_id: place.id 
    }]);
    setSearchKeyword('');
    setSearchResults([]);
  }

  // MSW로부터 모킹된 데이터 패칭
  const fetchVotes = async () => {
    if (axios.defaults.baseURL === undefined) return; // baseURL 설정 대기
    
    setIsLoading(true)
    try {
      const response = await axios.get('/votes')
      setVotes(response.data)
    } catch (error: any) {
      console.error('Failed to fetch votes:', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [])

  // 결과 데이터 페칭
  useEffect(() => {
    const fetchResults = async () => {
      if (activeTab === 'results' && selectedVote) {
        setIsLoading(true);
        try {
          const response = await axios.get(`/votes/${selectedVote.id}/results`);
          setResultsData(response.data);
        } catch (error) {
          console.error('Failed to fetch results:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchResults();
  }, [activeTab, selectedVote]);

  const handleVote = async (optionId: string, direction: 'left' | 'right') => {
    if (!selectedVote) return;
    console.log(`Voted ${direction} on option ${optionId}`)
    
    // LIKE한 경우에만 참여 API 호출
    if (direction === 'right') {
      try {
        await axios.post(`/votes/${selectedVote.id}/participate`, { optionId });
      } catch (e) {
        console.error('Failed to participate in vote', e);
      }
    }
    
    // 마지막 카드인 경우 결과 페이지로 이동
    if (currentIndex >= selectedVote.options.length - 1) {
      setActiveTab('results')
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleSelectVote = (voteId: string) => {
    const vote = votes.find(v => v.id === voteId);
    if (vote) {
      setSelectedVote(vote);
      setCurrentIndex(0);
      setActiveTab('vote');
    }
  }

  const simulateKakaoLogin = async () => {
    if (isLoggedIn) {
      setIsLoggedIn(false);
      return;
    }
    
    // 카카오 SDK가 로드되어 있다면 무조건 실제 로그인을 시도합니다.
    // (모킹 모드여도 로그인은 실제 백엔드와 연동하기 위함)
    if (window.Kakao && window.Kakao.Auth) {
      window.Kakao.Auth.authorize({
        redirectUri: window.location.origin
      });
      return;
    }

    // 카카오 SDK가 없는 경우에만 모킹 시뮬레이션을 수행합니다.
    if (import.meta.env.VITE_ENABLE_MOCKING === 'true') {
      setIsLoading(true);
      try {
        await axios.post('/auth/kakao', { accessToken: 'mock-access-token' });
        setIsLoggedIn(true);
      } catch (e) {
        console.error('Mock login failed', e);
      } finally {
        setIsLoading(false);
      }
      return;
    }
  }
  // URL에서 인가 코드 체크 및 로그인 처리
  useEffect(() => {
    const handleAuthCode = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (code && !isLoggedIn) {
        setIsLoading(true);
        try {
          console.log('Received Kakao Auth Code, requesting token...');
          // 백엔드 인증 요청 (인가 코드를 보내고 JWT 쿠키를 받습니다)
          await axios.post('/auth/kakao', { code });
          setIsLoggedIn(true);
          console.log('Login successful via Kakao Redirect');
        } catch (e) {
          console.error('Auth processing failed', e);
          alert('로그인 처리 중 오류가 발생했습니다.');
        } finally {
          setIsLoading(false);
          // 주소창에서 code 제거
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    handleAuthCode();
  }, [isLoggedIn]);

  const handleCreateVote = async () => {
    if (!newVoteTitle || newVoteOptions.length === 0) {
      alert('Please enter a title and add at least one restaurant.');
      return;
    }
    
    try {
      await axios.post('/votes', {
        title: newVoteTitle,
        options: newVoteOptions
      });
      alert('Vote Created Successfully!');
      setNewVoteTitle('');
      setNewVoteOptions([]);
      setActiveTab('list');
      
      // 목록 새로고침
      await fetchVotes();
    } catch (e) {
      console.error('Failed to create vote', e);
    }
  }

  const navTo = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="page">
      <header className="head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1>
            <em>Gourmet · Social</em>
            <span className="pin">
              <span className="x" style={{ width: '6px', height: '6px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></span>
              MVP v1.0
            </span>
          </h1>
          <button 
            onClick={simulateKakaoLogin}
            className="sketch-btn"
            style={{ padding: '4px 12px', fontSize: '14px', background: isLoggedIn ? 'var(--paper)' : '#FEE500' }}
          >
            {isLoggedIn ? 'LOGOUT' : 'KAKAO LOGIN'}
          </button>
        </div>
      </header>

      <nav className="nav-bar">
        <div className="logo" onClick={() => navTo('home')}>GS</div>
        <div className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navTo('home')}>Home</div>
        <div className={`nav-link ${activeTab === 'list' ? 'active' : ''}`} onClick={() => navTo('list')}>Explore</div>
        <div className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => navTo('create')}>Create</div>
      </nav>

      <main className="canvas">
        {activeTab === 'home' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <StickyNote color="yellow">
              <b>Ready to decide?</b><br/>
              Swipe your way to the best meal.
            </StickyNote>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍔</div>
            <h2 style={{ fontSize: '32px' }}>Pick Your Plate</h2>
            <p className="scribble-text" style={{ marginBottom: '32px' }}>Real-time social voting platform</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <SketchButton variant="primary" onClick={() => navTo('list')}>Find Votes</SketchButton>
              <SketchButton onClick={() => navTo('create')}>New Vote</SketchButton>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <VoteList votes={votes} onSelect={handleSelectVote} onRefresh={fetchVotes} />
        )}

        {activeTab === 'create' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>New Restaurant Vote</h2>
            <div className="sketch-box" style={{ padding: '32px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Vote Topic</label>
              <input 
                className="sketch-input" 
                placeholder="e.g. Best Pizza for Friday Night" 
                value={newVoteTitle}
                onChange={(e) => setNewVoteTitle(e.target.value)}
              />

              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Add Options</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', position: 'relative' }}>
                <input 
                  className="sketch-input" 
                  style={{ marginBottom: 0 }} 
                  placeholder="Search restaurant..." 
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchPlaces()}
                />
                <button className="sketch-btn" style={{ whiteSpace: 'nowrap' }} onClick={searchPlaces}>Search</button>
                
                {searchResults.length > 0 && (
                  <div className="sketch-box" style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    left: 0, 
                    right: 0, 
                    zIndex: 10, 
                    maxHeight: '200px', 
                    overflowY: 'auto',
                    padding: '8px'
                  }}>
                    {searchResults.map((place) => (
                      <div 
                        key={place.id} 
                        style={{ padding: '8px', borderBottom: '1px dashed var(--rule)', cursor: 'pointer' }}
                        onClick={() => addOption(place)}
                      >
                        <div style={{ fontWeight: 'bold' }}>{place.place_name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{place.address_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '24px' }}>
                {newVoteOptions.map((opt, idx) => (
                  <div key={idx} style={{ padding: '8px', borderBottom: '1px dashed var(--rule)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📍 {opt.name}</span>
                    <button onClick={() => setNewVoteOptions(newVoteOptions.filter((_, i) => i !== idx))} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                  </div>
                ))}
              </div>

              <SketchButton variant="primary" style={{ width: '100%' }} onClick={handleCreateVote}>Publish Vote</SketchButton>
            </div>
          </div>
        )}

        {activeTab === 'vote' && selectedVote && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', height: '500px', position: 'relative' }}>
            <h2 style={{ marginBottom: '20px' }}>{selectedVote.title}</h2>
            
            <div className="card-stack" style={{ position: 'relative', width: '320px', height: '400px' }}>
              {isLoading ? (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <p className="scribble-text">Fetching options...</p>
                </div>
              ) : selectedVote.options.length > currentIndex ? (
                <>
                  <SwipeVoteCard 
                    key={selectedVote.options[currentIndex].id}
                    id={selectedVote.options[currentIndex].id}
                    name={selectedVote.options[currentIndex].name}
                    emoji={currentIndex % 2 === 0 ? '🍕' : '🍣'} 
                    onVote={handleVote}
                  />
                  <div style={{ marginTop: '420px', width: '100%' }}>
                    <KakaoMap 
                      lat={selectedVote.options[currentIndex].lat}
                      lng={selectedVote.options[currentIndex].lng}
                      name={selectedVote.options[currentIndex].name}
                    />
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <p className="scribble-text">All done! No more options.</p>
                  <SketchButton onClick={() => setActiveTab('results')}>View Results</SketchButton>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'results' && selectedVote && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>Results: {selectedVote.title}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
              <div className="sketch-box">
                <h3 style={{ marginBottom: '16px' }}>🏆 Current Leader</h3>
                {isLoading ? (
                  <p className="scribble-text">Calculating votes...</p>
                ) : resultsData ? (
                  <>
                    <div style={{ fontSize: '48px', marginBottom: '8px' }}>
                      {/* 간단히 첫 번째 항목 이모지 */}
                      {resultsData.options[0]?.name.includes('김치') ? '🥘' : '🍕'}
                    </div>
                    <h4>{resultsData.options[0]?.name}</h4>
                    <p className="scribble-text">Total {resultsData.totalVotes} people participated!</p>
                    
                    <div style={{ marginTop: '24px' }}>
                      {resultsData.options.map((opt: any, i: number) => {
                        const percentage = resultsData.totalVotes > 0 
                          ? Math.round((opt.count / resultsData.totalVotes) * 100) 
                          : 0;
                        return (
                          <div key={opt.optionId} style={{ marginBottom: i < resultsData.options.length - 1 ? '12px' : 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                              <span>{opt.name}</span><span>{percentage}%</span>
                            </div>
                            <div style={{ height: i === 0 ? '12px' : '8px', background: 'var(--paper-tint)', border: '1px solid var(--ink)', marginTop: '4px' }}>
                              <div style={{ 
                                width: `${percentage}%`, 
                                height: '100%', 
                                background: i === 0 ? 'var(--highlight)' : 'var(--accent)',
                                opacity: i === 0 ? 1 : 0.5 
                              }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <p className="scribble-text">No results yet.</p>
                )}
              </div>
              <div>
                <KakaoMap 
                  lat={selectedVote.options[0]?.lat} 
                  lng={selectedVote.options[0]?.lng} 
                  name={selectedVote.options[0]?.name} 
                />
                <div style={{ marginTop: '16px' }}>
                  <SketchButton variant="primary" style={{ width: '100%' }} onClick={() => navTo('list')}>Back to List</SketchButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--pencil)', fontFamily: 'var(--mono)' }}>
        DESIGNED FOR DECISIONS · PNU CC TEAM 7
      </footer>
    </div>
  )
}

export default App
