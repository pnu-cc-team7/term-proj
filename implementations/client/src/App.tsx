import { useState } from 'react'
import './App.css'
import { SketchButton, StickyNote, PlaceCard } from './components/common'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [selectedPlace, setSelectedPlace] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 로그인 상태 관리 추가

  const navTo = (tab: string) => {
    setActiveTab(tab)
  }

  return (
    <div className="page">
      {/* 🏛️ App Header */}
      <header className="head">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <h1>
            <em>Gourmet · Social</em>
            <span className="pin">
              <span className="x" style={{ width: '6px', height: '6px', background: 'var(--accent)', transform: 'rotate(45deg)' }}></span>
              MVP v1.0
            </span>
          </h1>
          {/* 🔑 Kakao Login Placeholder */}
          <button 
            onClick={() => setIsLoggedIn(!isLoggedIn)}
            style={{ 
              background: '#FEE500', 
              border: '1.5px solid var(--ink)', 
              borderRadius: '4px', 
              padding: '4px 8px', 
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {isLoggedIn ? 'LOGOUT' : 'KAKAO LOGIN'}
          </button>
        </div>
        <div style={{ fontStyle: 'italic', color: 'var(--pencil)', fontSize: '18px' }}>
          Location-Based Restaurant Decision Platform
        </div>
      </header>

      {/* 🧭 Navigation Bar (Simplified) */}
      <nav className="nav-bar">
        <div className="logo" onClick={() => navTo('home')} style={{ cursor: 'pointer' }}>GS</div>
        <div className={`nav-link ${activeTab === 'home' ? 'active' : ''}`} onClick={() => navTo('home')}>Home</div>
        <div className={`nav-link ${activeTab === 'create' ? 'active' : ''}`} onClick={() => navTo('create')}>New Vote</div>
        <div className={`nav-link ${activeTab === 'explore' ? 'active' : ''}`} onClick={() => navTo('explore')}>Explore</div>
      </nav>

      {/* 🎨 Main Content Canvas */}
      <main className="canvas">
        {activeTab === 'home' && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <StickyNote color="yellow">
              <b>Welcome to Gourmet Social!</b><br/>
              This is a draft UI reflecting the prototype.
            </StickyNote>

            <div style={{ fontSize: '64px', marginBottom: '16px' }}>📍</div>
            <h2 style={{ fontSize: '32px', marginBottom: '8px' }}>Find Your Next Meal</h2>
            
            <div style={{ marginTop: '24px', textAlign: 'left' }}>
              <p className="scribble-text">Try selecting a place:</p>
              <PlaceCard 
                emoji="🍕" 
                name="Pizza Heaven" 
                address="123 Gangnam-daero" 
                selected={selectedPlace}
                onClick={() => setSelectedPlace(!selectedPlace)}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <SketchButton variant="primary" style={{ flex: 1 }} onClick={() => navTo('create')}>Create New Vote</SketchButton>
              <SketchButton style={{ flex: 1 }} onClick={() => navTo('explore')}>Join Active</SketchButton>
            </div>
          </div>
        )}
        
        {/* Placeholder for other screens */}
        {activeTab !== 'home' && (
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h2 style={{ fontSize: '28px' }}>{activeTab.toUpperCase()} Section</h2>
            <p style={{ fontFamily: 'var(--hand)', fontStyle: 'italic', color: 'var(--pencil)' }}>Coming soon...</p>
          </div>
        )}
      </main>

      {/* 🚦 Footer Info */}
      <footer style={{ marginTop: '24px', textAlign: 'center', fontSize: '14px', color: 'var(--pencil)', fontFamily: 'var(--mono)' }}>
        READY TO VOTE · GANGNAM, SEOUL
      </footer>
    </div>
  )
}

export default App
