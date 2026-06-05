import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './App.css';
import { SketchButton, StickyNote } from './components/common';
import { MapPlacePicker, type VoteOptionDraft } from './components/vote/MapPlacePicker';
import { SwipeVoteCard } from './components/vote/SwipeVoteCard';
import { VoteList } from './components/vote/VoteList';
import { VoteResult } from './components/vote/VoteResult';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.withCredentials = true;

interface VoteOption {
  id: string | number;
  name: string;
  kakao_id?: string;
  lat?: number;
  lng?: number;
}

interface Vote {
  id: string;
  title: string;
  status: string;
  options: VoteOption[];
}

type Tab = 'home' | 'list' | 'create' | 'vote' | 'result';

const getKakaoAuthClientId = () =>
  String(
    import.meta.env.VITE_KAKAO_REST_API_KEY ||
      import.meta.env.VITE_KAKAO_MAP_KEY ||
      '',
  ).trim();

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message || error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
};

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [selectedVote, setSelectedVote] = useState<Vote | null>(null);
  const [currentOptionIndex, setCurrentOptionIndex] = useState(0);
  const [likedOptionIds, setLikedOptionIds] = useState<string[]>([]);
  const [resultVoteId, setResultVoteId] = useState<string | null>(null);

  const [newVoteTitle, setNewVoteTitle] = useState('');
  const [newVoteOptions, setNewVoteOptions] = useState<VoteOptionDraft[]>([]);
  const [createAttempted, setCreateAttempted] = useState(false);
  const [createMessage, setCreateMessage] = useState<string | null>(null);
  const [isCreatingVote, setIsCreatingVote] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  const authProcessing = useRef(false);

  const navTo = (tab: Tab) => {
    setActiveTab(tab);
  };

  const fetchVotes = useCallback(async () => {
    try {
      const response = await axios.get<unknown>('/votes');

      if (!Array.isArray(response.data)) {
        console.error('Unexpected /votes response:', response.data);
        setVotes([]);
        return;
      }

      setVotes(response.data as Vote[]);
    } catch (error) {
      console.error('Failed to fetch votes:', getErrorMessage(error));
      setVotes([]);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchVotes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchVotes]);

  useEffect(() => {
    const handleAuthCode = async () => {
      const code = new URL(window.location.href).searchParams.get('code');

      if (code && !isLoggedIn && !authProcessing.current) {
        const handledCode = window.sessionStorage.getItem('gourmet_last_kakao_code');

        window.history.replaceState({}, document.title, window.location.pathname);

        if (handledCode === code) {
          return;
        }

        window.sessionStorage.setItem('gourmet_last_kakao_code', code);
        authProcessing.current = true;
        try {
          await axios.post('/auth/kakao', { code });
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Auth processing failed:', getErrorMessage(error));
          alert('Login failed. Please try again.');
        } finally {
          authProcessing.current = false;
        }
      }
    };

    handleAuthCode();
  }, [isLoggedIn]);

  const handleAddVoteOption = (option: VoteOptionDraft) => {
    setNewVoteOptions((currentOptions) => {
      if (currentOptions.some((item) => item.kakao_id === option.kakao_id)) {
        return currentOptions;
      }

      return [...currentOptions, option];
    });
    setCreateMessage(null);
  };

  const handleRemoveVoteOption = (kakaoId: string) => {
    setNewVoteOptions((currentOptions) =>
      currentOptions.filter((option) => option.kakao_id !== kakaoId),
    );
  };

  const handleCreateVote = async () => {
    setCreateAttempted(true);
    setCreateMessage(null);

    if (!isLoggedIn) {
      setCreateMessage('Log in before creating a vote.');
      return;
    }

    if (!newVoteTitle.trim()) {
      setCreateMessage('Enter a vote topic before publishing.');
      return;
    }

    if (newVoteOptions.length < 2) {
      setCreateMessage('Add at least two restaurants to publish this vote.');
      return;
    }

    try {
      setIsCreatingVote(true);
      await axios.post('/votes', {
        title: newVoteTitle.trim(),
        options: newVoteOptions,
      });
      setNewVoteTitle('');
      setNewVoteOptions([]);
      setCreateAttempted(false);
      setCreateMessage(null);
      setActiveTab('list');
      await fetchVotes();
    } catch (error) {
      setCreateMessage('Failed to create vote: ' + getErrorMessage(error));
    } finally {
      setIsCreatingVote(false);
    }
  };

  const handleSelectVote = (voteId: string) => {
    if (!isLoggedIn) {
      alert('Please log in to participate in the vote swiping experience.');
      return;
    }

    const vote = votes.find((item) => item.id === voteId);

    if (vote) {
      setSelectedVote(vote);
      setCurrentOptionIndex(0);
      setLikedOptionIds([]);
      setActiveTab('vote');
    }
  };

  const handleViewResults = (voteId: string) => {
    setResultVoteId(voteId);
    setActiveTab('result');
  };

  const handleKakaoLogin = () => {
    setAuthMessage(null);

    const clientId = getKakaoAuthClientId();
    const redirectUri = window.location.origin;

    if (!clientId) {
      setAuthMessage(
        'Kakao login key is missing. Add VITE_KAKAO_REST_API_KEY or VITE_KAKAO_MAP_KEY to implementations/client/.env.local.',
      );
      return;
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
    });

    window.location.href = `https://kauth.kakao.com/oauth/authorize?${params.toString()}`;
  };

  const handleVote = async (optionId: string, direction: 'left' | 'right') => {
    if (!selectedVote) return;

    let updatedLikedIds = [...likedOptionIds];
    if (direction === 'right') {
      updatedLikedIds.push(optionId);
      setLikedOptionIds(updatedLikedIds);
    }

    if (currentOptionIndex < selectedVote.options.length - 1) {
      setCurrentOptionIndex((previous) => previous + 1);
      return;
    }

    // 모든 선택 수집 완료: 중복 제거 후 백엔드 규격에 맞춰 optionIds 전송
    try {
      const uniqueLikedIds = Array.from(new Set(updatedLikedIds));
      await axios.post(`/votes/${selectedVote.id}/participate`, {
        optionIds: uniqueLikedIds,
      });
      alert(uniqueLikedIds.length > 0 
        ? `${uniqueLikedIds.length}개의 맛집을 선택하셨습니다! 결과를 확인합니다.`
        : '선택된 맛집이 없습니다. 결과를 확인합니다.');
    } catch (error) {
      alert('투표 반영 실패: ' + getErrorMessage(error));
    }

    // 결과 페이지 이동 시 새로운 조회를 강제하기 위해 상태 업데이트
    setResultVoteId(null);
    setTimeout(() => {
      setResultVoteId(selectedVote.id);
      setActiveTab('result');
    }, 0);
    await fetchVotes();
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    const restApiKey = getKakaoAuthClientId();
    const logoutRedirectUri = window.location.origin;

    if (!restApiKey) {
      setAuthMessage('Logged out locally. Kakao logout key is not configured.');
      return;
    }

    window.location.href = `https://kauth.kakao.com/oauth/logout?client_id=${restApiKey}&logout_redirect_uri=${logoutRedirectUri}`;
  };

  const selectedOption = selectedVote?.options[currentOptionIndex];
  const publishDisabled = newVoteOptions.length < 2 || isCreatingVote;

  return (
    <div className="page">
      <header className="head">
        <div className="head-row">
          <h1>
            <em>Gourmet Social</em>
            <span className="pin">
              <span className="x" />
              MVP v1.0
            </span>
          </h1>
          <button
            onClick={() => (isLoggedIn ? handleLogout() : handleKakaoLogin())}
            className="sketch-btn login-button"
          >
            {isLoggedIn ? 'Logout' : 'Kakao Login'}
          </button>
        </div>
        {authMessage && <p className="inline-message error auth-message">{authMessage}</p>}
      </header>

      <nav className="nav-bar">
        <div className="logo" onClick={() => navTo('home')}>GS</div>
        <div
          className={`nav-link ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => navTo('home')}
        >
          Home
        </div>
        <div
          className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => navTo('list')}
        >
          Explore
        </div>
        <div
          className={`nav-link ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => navTo('create')}
        >
          Create
        </div>
      </nav>

      <main className="canvas">
        {activeTab === 'home' && (
          <div className="home-view">
            <StickyNote color="yellow">
              <b>Ready to decide?</b>
              <br />
              Swipe for your best meal.
            </StickyNote>
            <h2>Pick Your Plate</h2>
            <p className="scribble-text">Real-time Social Food Voting Platform</p>
            <div className="home-actions">
              <SketchButton variant="primary" onClick={() => navTo('list')}>
                Find Votes
              </SketchButton>
              <SketchButton onClick={() => navTo('create')}>Create New Vote</SketchButton>
            </div>
          </div>
        )}

        {activeTab === 'list' && (
          <VoteList
            votes={votes}
            isLoggedIn={isLoggedIn}
            onSelect={handleSelectVote}
            onViewResults={handleViewResults}
            onRefresh={fetchVotes}
            onCreateRedirect={() => navTo('create')}
          />
        )}

        {activeTab === 'create' && (
          <div className="create-vote-container">
            <h2>New Food Vote</h2>
            {!isLoggedIn ? (
              <div className="sketch-box login-required-box">
                <div className="login-required-icon">GS</div>
                <h3>Login Required</h3>
                <p className="scribble-text">
                  To prevent spam and ensure fair voting,
                  <br />
                  you need to log in to create your own food polls.
                </p>
                <SketchButton
                  variant="primary"
                  onClick={handleKakaoLogin}
                >
                  Login with Kakao
                </SketchButton>
                {authMessage && <p className="inline-message error auth-message">{authMessage}</p>}
              </div>
            ) : (
              <div className="create-vote-panel">
                <div className="vote-topic-row">
                  <label htmlFor="vote-title">Vote Topic</label>
                  <input
                    id="vote-title"
                    className="sketch-input"
                    placeholder="e.g., What's for lunch today?"
                    value={newVoteTitle}
                    onChange={(event) => {
                      setNewVoteTitle(event.target.value);
                      setCreateMessage(null);
                    }}
                  />
                  {createAttempted && !newVoteTitle.trim() && (
                    <p className="inline-message error">Enter a vote topic.</p>
                  )}
                </div>

                <MapPlacePicker
                  options={newVoteOptions}
                  onAddOption={handleAddVoteOption}
                  onRemoveOption={handleRemoveVoteOption}
                />

                <div className="create-submit-bar">
                  <div className="publish-status">
                    {createMessage ? (
                      <span className="inline-message error">{createMessage}</span>
                    ) : (
                      <span>
                        {newVoteOptions.length < 2
                          ? 'Add at least two restaurants to publish.'
                          : 'Ready to publish this food vote.'}
                      </span>
                    )}
                  </div>
                  <SketchButton
                    variant="primary"
                    onClick={handleCreateVote}
                    disabled={publishDisabled}
                  >
                    {isCreatingVote ? 'Publishing...' : '투표 게시하기'}
                  </SketchButton>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'vote' && selectedVote && (
          <div className="vote-view">
            <h2>{selectedVote.title}</h2>
            <div className="swipe-stage">
              {selectedOption && (
                <SwipeVoteCard
                  key={String(selectedOption.id)}
                  id={String(selectedOption.id)}
                  name={selectedOption.name}
                  emoji="GS"
                  onVote={handleVote}
                />
              )}
            </div>
            <p className="scribble-text">
              Option {currentOptionIndex + 1} of {selectedVote.options.length}
            </p>
          </div>
        )}

        {activeTab === 'result' && resultVoteId && (
          <VoteResult
            voteId={resultVoteId}
            voteTitle={votes.find((vote) => vote.id === resultVoteId)?.title || 'Vote Results'}
            onBack={() => navTo('list')}
          />
        )}
      </main>
    </div>
  );
}

export default App;
