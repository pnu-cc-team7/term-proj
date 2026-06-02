import { useState, useEffect } from 'react'
import './App.css'
import { SketchButton, StickyNote } from './components/common'
import { SwipeVoteCard } from './components/vote/SwipeVoteCard'
import axios from 'axios'

interface VoteOption {
  id: string;
  name: string;
}

interface Vote {
  id: string;
  title: string;
  options: VoteOption[];
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [votes, setVotes] = useState<Vote[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  // MSW로부터 모킹된 데이터 패칭
  useEffect(() => {
    const fetchVotes = async () => {
      try {
        const response = await axios.get('/votes')
        setVotes(response.data)
      } catch (error) {
        console.error('Failed to fetch votes:', error)
      }
    }
    fetchVotes()
  }, [])

  const handleVote = (optionId: string, direction: 'left' | 'right') => {
    console.log(`Voted ${direction} on option ${optionId}`)
    // 다음 카드로 넘어가기 (실제로는 투표 API 호출 로직이 들어감)
    setCurrentIndex((prev) => prev + 1)
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
            onClick={() => setIsLoggedIn(!isLoggedIn)}
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
        <div className={`nav-link ${activeTab === 'vote' ? 'active' : ''}`} onClick={() => navTo('vote')}>Vote</div>
        <div className={`nav-link ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => navTo('explore')}>Explore</div>
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
            <SketchButton variant="primary" onClick={() => navTo('vote')}>Start Swiping!</SketchButton>
          </div>
        )}

        {activeTab === 'vote' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px', height: '500px', position: 'relative' }}>
            <h2 style={{ marginBottom: '20px' }}>{votes[0]?.title || 'Loading...'}</h2>
            
            <div className="card-stack" style={{ position: 'relative', width: '320px', height: '400px' }}>
              {votes.length > 0 && currentIndex < votes[0].options.length ? (
                // 현재 옵션을 카드로 표시
                <SwipeVoteCard 
                  key={votes[0].options[currentIndex].id}
                  id={votes[0].options[currentIndex].id}
                  name={votes[0].options[currentIndex].name}
                  emoji={currentIndex % 2 === 0 ? '🍕' : '🍣'} // 가짜 이모지
                  onVote={handleVote}
                />
              ) : (
                <div style={{ textAlign: 'center', marginTop: '100px' }}>
                  <p className="scribble-text">All done! No more options.</p>
                  <SketchButton onClick={() => setCurrentIndex(0)}>Restart</SketchButton>
                </div>
              )}
            </div>
          </div>
        )}
        
        {(activeTab !== 'home' && activeTab !== 'vote') && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h2 style={{ fontSize: '28px' }}>{activeTab.toUpperCase()} Section</h2>
            <p className="scribble-text">Coming soon...</p>
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
