import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './FriendSearchPage.css';
import defaultProfile from '../../assets/default-profile.png';

// 아이콘 (경로 확인해주세요!)
import addUserIconSection from '../../assets/add_user.png'; 
import friendListIconSection from '../../assets/friendlists.png'; 
import searchIcon from '../../assets/search.png'; 
import toggleDown from '../../assets/toggle_down.png';
import toggleUp from '../../assets/toggle_up.png';
import backIcon from '../../assets/back.png'; 

// 액션 아이콘
import requestIcon from '../../assets/add_user.png'; // +(신청)
import rejectIcon from '../../assets/close_icon.png'; // X(취소/삭제)

const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function FriendSearchPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // 토글 상태
  const [isAddOpen, setIsAddOpen] = useState(true);
  const [isListOpen, setIsListOpen] = useState(true);

  // 데이터 상태
  const [keyword, setKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]); 
  const [friends, setFriends] = useState([]);
  
  // 보낸 요청 매핑용 (userId -> requestId)
  const [sentMap, setSentMap] = useState(new Map());
const [sentRequests, setSentRequests] = useState([]);
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': user?.id ? String(user.id) : '',
  });

  // 1. 초기 로딩: 친구 목록 & 보낸 요청 목록 가져오기
  useEffect(() => {
    if (!token || !user) return;
    fetchInitialData();
  }, [token, user]);

  const fetchInitialData = async () => {
    try {
      // (1) 친구 목록
      const friendRes = await fetch(`${API_BASE}/users/friendships`, { headers: getHeaders() });
      const friendData = await friendRes.json();
      if (friendData.isSuccess) {
        setFriends(friendData.result || []);
      }

      // (2) 보낸 요청 목록 (취소 기능을 위해 미리 로드)
      const sentRes = await fetch(`${API_BASE}/friendships/requests?type=sent`, { headers: getHeaders() });
      const sentData = await sentRes.json();

      console.log("보낸 요청 데이터 확인:", sentData);
      if (sentData.isSuccess) {
        // API 응답 키(receiver...)를 UI 키(username, tag...)로 매핑
        const mappedSent = (sentData.result || []).map(item => ({
            id: item.id, // 요청 ID
            userId: item.receiverId,
            username: item.receiverUsername || "알 수 없음", 
            tag: item.receiverTag || "",
            avatarUrl: item.receiverAvatarUrl
        }));
        setSentRequests(mappedSent);
        const initialSentMap = new Map();
        mappedSent.forEach(req => {
            initialSentMap.set(req.userId, req.id);
        });
        setSentMap(initialSentMap);
      }
    }
      catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  // 2. 실시간 검색
  const handleSearchChange = async (e) => {
    const val = e.target.value;
    setKeyword(val);

    if (!val.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/users/friendships/search?keyword=${encodeURIComponent(val)}`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (data.isSuccess) {
        setSearchResults(data.result || []);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("검색 에러:", err);
    }
  };

  // 3. 친구 요청 보내기 (+)
  const sendRequest = async (targetId) => {
    try {
      const res = await fetch(`${API_BASE}/friendships/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId: targetId }),
      });
      const data = await res.json();
      
      if (data.isSuccess) {
        // 성공 시: 응답에서 받은 requestId를 맵에 저장하고 UI 갱신
        const newReqId = data.result.id;
        setSentMap(prev => new Map(prev).set(targetId, newReqId));
        
        // 검색 결과의 상태도 업데이트 (pendingSent: true)
        setSearchResults(prev => prev.map(u => 
          u.id === targetId ? { ...u, pendingSent: true } : u
        ));
      } else {
        alert(data.message || "요청 실패");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 4. 요청 취소 (X) - 검색 결과 탭에서
  const cancelRequest = async (targetUserId) => {
    // 해당 유저에게 보낸 요청 ID 찾기
    const requestId = sentMap.get(targetUserId);
    if (!requestId) return alert("요청 정보를 찾을 수 없습니다.");

    if (!confirm("보낸 요청을 취소하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE}/friendships/requests/${requestId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();

      if (data.isSuccess) {
        // 성공 시: 맵에서 제거 및 UI 갱신
        const newMap = new Map(sentMap);
        newMap.delete(targetUserId);
        setSentMap(newMap);

        setSearchResults(prev => prev.map(u => 
            u.id === targetUserId ? { ...u, pendingSent: false } : u
        ));
      } else {
        alert(data.message);
      }
    } catch (err) { console.error(err); }
  };

  // 5. 친구 삭제 (X) - 친구 목록 탭에서
  const deleteFriend = async (friendId) => {
    if (!confirm("친구를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`${API_BASE}/users/friendships/${friendId}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      const data = await res.json();

      if (data.isSuccess) {
        // 목록에서 즉시 제거
        setFriends(prev => prev.filter(f => f.id !== friendId));
        // 검색 결과가 있다면 거기도 반영
        setSearchResults(prev => prev.map(u => 
            u.id === friendId ? { ...u, friend: false } : u
        ));
      } else {
        alert(data.message);
      }
    } catch (err) { console.error(err); }
  };


  return (
    <div className="friend-search-page">
      {/* 헤더 */}
      <header className="friend-header">
        <button className="back-button" onClick={() => navigate(-1)}>
           &lt;
        </button>
        {/* 헤더 타이틀텍스트 없음 */}
        
        <div style={{ width: 30 }}></div>
      </header>

      <div className="friend-content">
        
            <div className="section-title-group">
             <img src={addUserIconSection} className="section-icon" alt="icon" />
              <span className="section-title">친구 추가하기</span>
            </div>
          
 <div className="add-friend-section">
  {/* 검색창 */}
  <div className="search-box">
    <img src={searchIcon} className="search-icon-left" alt="search" />
    <input
      type="text"
      placeholder="친구의 아이디로 검색하세요"
      value={keyword}
      onChange={handleSearchChange}
    />

    {keyword && (
      <img
        src={rejectIcon}
        className="search-icon-clear"
        alt="clear"
        onClick={() => {
          setKeyword('');
          setSearchResults([]);
        }}
      />
    )}
  </div>

  {/* 검색 결과 리스트 */}
  <div className="friend-list">
    {keyword && searchResults.length === 0 ? (
      <p className="empty-msg">검색 결과가 없습니다.</p>
    ) : (
      searchResults.map(u => {
        const isSent = u.pendingSent || sentMap.has(u.id);

        return (
          <div className="friend-item" key={u.id}>
            <div className="friend-info"
                onClick={() => navigate(`/user/${u.id}`)} 
      style={{ cursor: 'pointer' }}
      >
              <img src={u.avatarUrl || defaultProfile} className="friend-img" alt="프사" />
              <div className="friend-text">
                <span className="friend-name">{u.username}</span>
                <span className="friend-tag">#{u.tag}</span>
              </div>
            </div>

            <div className="friend-actions">
              {u.id === user?.id ? (
                <span className="status-badge">나</span>
              ) : u.friend ? (
                <span className="status-badge">이미 친구</span>
              ) : u.pendingReceived ? (
                <span className="status-badge">요청 받음</span>
              ) : isSent ? (
                <button className="action-icon-btn" onClick={() => cancelRequest(u.id)}>
                  <img src={rejectIcon} className="action-icon" alt="취소" />
                </button>
              ) : (
                <button className="action-request-btn" onClick={() => sendRequest(u.id)}>
                  <img src={requestIcon} className="action-icon" alt="요청" />
                  <span className="request-text">친구 요청하기</span>
                </button>
              )}
            </div>
          </div>
        );
      })
    )}
  </div>
</div>  


        {/* [탭 2] 친구 목록 */}
        <div className="friend-section">
          <div className="section-header" onClick={() => setIsListOpen(!isListOpen)}>
            <div className="section-title-group">
              <img src={friendListIconSection} className="section-icon" alt="icon" />
              <span className="section-title">친구 목록</span>
              <span className="section-count">{friends.length}</span>
            </div>
            <img 
             src={isListOpen ? toggleUp : toggleDown} 
              className="toggle-icon"
              alt="toggle" 
            />
          </div>

          {isListOpen && (
            <div className="friend-list-section">
              <div className="friend-list">
                {friends.length > 0 ? (
                  friends.map(f => (
                    <div className="friend-item" key={f.id}>
                      <div className="friend-info" 
  onClick={() => navigate(`/user/${f.id}`)}
  style={{ cursor: 'pointer' }}>
                        <img src={f.avatarUrl || defaultProfile} className="friend-img" alt="프사" />
                        <div className="friend-text">
                          <span className="friend-name">{f.username}</span>
                          <span className="friend-tag">#{f.tag}</span>
                        </div>
                      </div>
                      <div className="friend-actions">
                        {/* 친구 삭제 (X 아이콘) */}
                        <button className="action-icon-btn" onClick={() => deleteFriend(f.id)}>
                          <img src={rejectIcon} className="action-icon" alt="삭제" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="empty-msg">친구가 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}