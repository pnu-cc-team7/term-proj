import { useState, useEffect, useRef } from 'react'
import './App.css'
import { SketchButton, StickyNote } from './components/common'
import { SwipeVoteCard } from './components/vote/SwipeVoteCard'
import { VoteList } from './components/vote/VoteList'
import axios from 'axios'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

declare global {
  interface Window {
    kakao: any;
    Kakao: any;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [votes, setVotes] = useState<any[]>([])
  const [selectedVote, setSelectedVote] = useState<any | null>(null)
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0)
  const [lastLikedOptionId, setLastLikedOptionId] = useState<string | null>(null)

  const [newVoteTitle, setNewVoteTitle] = useState('')
  const [newVoteOptions, setNewVoteOptions] = useState<any[]>([])
  const [searchKeyword, setSearchKeyword] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  const authProcessing = useRef(false);

  useEffect(() => {
    // Load Kakao Maps SDK (Ensure availability at App level for search)
    const scriptId = 'kakao-maps-sdk'; 
    const apiKey = import.meta.env.VITE_KAKAO_MAP_KEY;
    
    if (!document.getElementById(scriptId) && apiKey) {
      console.log('--- App: Injecting Kakao Maps SDK ---');
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
      
      script.onload = () => {
        if (window.kakao && window.kakao.maps) {
          window.kakao.maps.load(() => {
            console.log('--- App: Kakao Maps SDK Fully Initialized ---');
          });
        }
      };
      document.head.appendChild(script);
    }
  }, []);

  const navTo = (tab: string) => {
    setActiveTab(tab)
  }

  const searchPlaces = () => {
    if (!searchKeyword.trim()) return;
    
    const kakao = window.kakao;
    if (!kakao || !kakao.maps) {
      alert('Initializing Kakao Map service. Please try again in a moment.');
      return;
    }
    
    // Ensure services are loaded
    kakao.maps.load(() => {
      if (!kakao.maps.services || !kakao.maps.services.Places) {
        console.error('Kakao Maps Services not available even after load()');
        alert('Map service is unavailable. Please check your network or API key.');
        return;
      }
      
      const ps = new kakao.maps.services.Places();
      ps.keywordSearch(searchKeyword, (data: any, status: any) => {
        if (status === kakao.maps.services.Status.OK) {
          setSearchResults(data);
        } else {
          alert('No results found for "' + searchKeyword + '"');
        }
      });
    });
  }

  const addOption = (place: any) => {
    if (newVoteOptions.find(opt => opt.kakao_id === place.id)) {
      alert('This place is already added.');
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

  const fetchVotes = async () => {
    try {
      const response = await axios.get('/votes')
      setVotes(response.data)
    } catch (error: any) {
      console.error('Failed to fetch votes:', error.message)
    }
  }

  useEffect(() => {
    fetchVotes()
  }, [])

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = new URL(window.location.href).searchParams.get('code');
      if (code && !isLoggedIn && !authProcessing.current) {
        authProcessing.current = true;
        try {
          console.log('--- App: Processing Auth Code ---');
          await axios.post('/auth/kakao', { code });
          setIsLoggedIn(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e: any) {
          console.error('Auth processing failed:', e.response?.data || e.message);
          alert('Login failed. Please try again.');
        } finally {
          authProcessing.current = false;
        }
      }
    };
    handleAuthCode();
  }, [isLoggedIn]);

  const handleCreateVote = async () => {
    if (!newVoteTitle || newVoteOptions.length === 0) {
      alert('Please enter a title and add at least one place.');
      return;
    }
    
    try {
      await axios.post('/votes', {
        title: newVoteTitle,
        options: newVoteOptions
      });
      alert('Vote successfully created!');
      setNewVoteTitle('');
      setNewVoteOptions([]);
      setActiveTab('list');
      await fetchVotes();
    } catch (e: any) {
      const errorMsg = e.response?.data?.message || e.message;
      alert('Failed to create vote: ' + errorMsg);
    }
  }

  const handleSelectVote = (voteId: string) => {
    const vote = votes.find(v => v.id === voteId);
    if (vote) {
      setSelectedVote(vote);
      setCurrentOptionIndex(0);
      setLastLikedOptionId(null);
      setActiveTab('vote');
    }
  }

  const handleVote = async (optionId: string, direction: 'left' | 'right') => {
    if (!selectedVote) return;

    // Track the latest "LIKE"
    if (direction === 'right') {
      setLastLikedOptionId(optionId);
    }

    // Move to next card or submit
    if (currentOptionIndex < selectedVote.options.length - 1) {
      setCurrentOptionIndex(prev => prev + 1);
    } else {
      // Last card swiped
      if (direction === 'right' || lastLikedOptionId) {
        const finalOptionId = direction === 'right' ? optionId : lastLikedOptionId;
        try {
          await axios.post(`/votes/${selectedVote.id}/participate`, {
            optionId: finalOptionId
          });
          alert('Vote recorded! Thanks for participating.');
        } catch (e: any) {
          const errorMsg = e.response?.data?.message || e.message;
          alert('Failed to vote: ' + errorMsg);
        }
      } else {
        alert('No options selected. Feel free to vote later!');
      }
      
      navTo('list');
      await fetchVotes();
    }
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
            onClick={() => window.Kakao?.Auth.authorize({ redirectUri: window.location.origin })}
            className="sketch-btn"
            style={{ padding: '4px 12px', fontSize: '14px', background: isLoggedIn ? 'var(--paper)' : '#FEE500' }}
          >
            {isLoggedIn ? 'Logout' : 'Kakao Login'}
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
              Swipe for your best meal.
            </StickyNote>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🍔</div>
            <h2 style={{ fontSize: '32px' }}>Pick Your Plate</h2>
            <p className="scribble-text" style={{ marginBottom: '32px' }}>Real-time Social Food Voting Platform</p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <SketchButton variant="primary" onClick={() => navTo('list')}>Find Votes</SketchButton>
              <SketchButton onClick={() => navTo('create')}>Create New Vote</SketchButton>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <VoteList 
            votes={votes} 
            onSelect={handleSelectVote} 
            onRefresh={fetchVotes} 
            onCreateRedirect={() => navTo('create')}
          />
        )}

        {activeTab === 'create' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ marginBottom: '24px' }}>New Food Vote</h2>
            <div className="sketch-box" style={{ padding: '32px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px' }}>Vote Topic</label>
              <input className="sketch-input" placeholder="e.g., What's for lunch today?" value={newVoteTitle} onChange={(e) => setNewVoteTitle(e.target.value)} />
              
              <label style={{ display: 'block', fontWeight: 'bold', marginTop: '16px', marginBottom: '8px' }}>Add Place</label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', position: 'relative' }}>
                <input className="sketch-input" style={{ marginBottom: 0 }} placeholder="Search places..." value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchPlaces()} />
                <button className="sketch-btn" onClick={searchPlaces}>Search</button>
                
                {searchResults.length > 0 && (
                  <div className="sketch-box" style={{ position: 'absolute', top: '50px', left: 0, right: 0, zIndex: 10, maxHeight: '200px', overflowY: 'auto', padding: '8px' }}>
                    {searchResults.map((place) => (
                      <div key={place.id} style={{ padding: '8px', borderBottom: '1px dashed var(--rule)', cursor: 'pointer' }} onClick={() => addOption(place)}>
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
              <SketchButton variant="primary" style={{ width: '100%' }} onClick={handleCreateVote}>Create Vote</SketchButton>
            </div>
          </div>
        )}

        {activeTab === 'vote' && selectedVote && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>{selectedVote.title}</h2>
            <div style={{ position: 'relative', width: '320px', height: '420px' }}>
              {selectedVote.options[currentOptionIndex] && (
                <SwipeVoteCard 
                  key={selectedVote.options[currentOptionIndex].id}
                  id={selectedVote.options[currentOptionIndex].id} 
                  name={selectedVote.options[currentOptionIndex].name} 
                  emoji="🍱"
                  onVote={handleVote} 
                />
              )}
            </div>
            <p className="scribble-text" style={{ marginTop: '20px', opacity: 0.7 }}>
              Option {currentOptionIndex + 1} of {selectedVote.options.length}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
