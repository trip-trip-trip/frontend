import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './FriendListPage.css';
import defaultProfile from '../../assets/default-profile.png';

// 아이콘 임포트 (없으면 파일명 맞춰주세요)
import addUserIcon from '../../assets/add_user.png'; 
import toggleDown from '../../assets/toggle_down.png'; 
import toggleUp from '../../assets/toggle_up.png'; 
import checkIcon from '../../assets/check_icon.png'; 
import closeIcon from '../../assets/close_icon.png'; 
import receiveIcon from '../../assets/receive.png'; // 받은 요청 아이콘
import sendIcon from '../../assets/send.png';       // 보낸 요청 아이콘
import friendListIcon from '../../assets/friendlists.png'; // 친구 목록 아이콘

const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function FriendListPage() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  // 데이터 State
  const [receivedRequests, setReceivedRequests] = useState([]); 
  const [sentRequests, setSentRequests] = useState([]); 
  const [friends, setFriends] = useState([]);

  // 토글 State (기본값 true: 열림)
  const [isReceivedOpen, setIsReceivedOpen] = useState(true);
  const [isSentOpen, setIsSentOpen] = useState(true);
  const [isFriendOpen, setIsFriendOpen] = useState(true);

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': user?.id ? String(user.id) : '',
  });

  useEffect(() => {
    if (!token || !user) return;
    fetchData();
  }, [token, user]);
const fetchData = async () => {
    try {
      // 1. 받은 요청 목록 (type=received 또는 생략)
      const reqRes = await fetch(`${API_BASE}/friendships/requests?type=received`, { headers: getHeaders() });
      const reqData = await reqRes.json();
      if (reqData.isSuccess) {
        setReceivedRequests(reqData.result || []);
      }

      // 2. 친구 목록
      const friendRes = await fetch(`${API_BASE}/users/friendships`, { headers: getHeaders() });
      const friendData = await friendRes.json();
      if (friendData.isSuccess) {
        setFriends(friendData.result || []);
      }

      // 3. [NEW] 보낸 요청 목록 (type=sent)
      const sentRes = await fetch(`${API_BASE}/friendships/requests?type=sent`, { headers: getHeaders() });
      const sentData = await sentRes.json();
      if (sentData.isSuccess) {
        // API 응답(receiver...)을 UI에 맞는 키(username, avatarUrl...)로 매핑
        const mappedSent = (sentData.result || []).map(item => ({
            id: item.id, // 요청 ID
            userId: item.receiverId,
            username: item.receiverUsername,
            tag: item.receiverTag|| "",
            avatarUrl: item.receiverAvatarUrl
        }));
        setSentRequests(mappedSent);
      }

    } catch (err) {
      console.error("데이터 로드 실패:", err);
    }
  };

  // 수락/거절 처리
  const handleRespond = async (requestId, action) => {
    try {
      const res = await fetch(`${API_BASE}/friendships/requests/${requestId}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ action }), // "ACCEPT" or "REJECT"
      });
      const data = await res.json();
      if (data.isSuccess) {
        fetchData(); // 목록 갱신
      } else {
        alert(data.message || "실패했습니다.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 삭제/취소 처리
  const handleDelete = async (targetId, type) => {
    const isFriendDelete = type === 'friend';
    const msg = isFriendDelete ? "친구를 삭제하시겠습니까?" : "요청을 취소하시겠습니까?";
    
    if (!confirm(msg)) return;

    try {
      let url;
      if (isFriendDelete) {
        // 1. 친구 삭제: DELETE /users/friendships/{friend_user_id}
        // (targetId는 친구의 user_id 여야 함)
        url = `${API_BASE}/users/friendships/${targetId}`;
      } else {
        // 2. 요청 취소: DELETE /friendships/requests/{request_id}
        // (targetId는 요청의 id 여야 함)
        url = `${API_BASE}/friendships/requests/${targetId}`;
      }

      const res = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(),
      });

      const data = await res.json();
      if (data.isSuccess) {
        // alert(isFriendDelete ? "친구가 삭제되었습니다." : "요청이 취소되었습니다.");
        // 목록 갱신 (서버 데이터 다시 불러오기)
        fetchData();
      } else {
        alert(data.message || "실패했습니다.");
      }
    } catch (err) {
      console.error("삭제/취소 에러:", err);
      alert("오류가 발생했습니다.");
    }
  };

  return (
    <div className="friend-page">
      <header className="friend-header">
        <button className="back-button" onClick={() => navigate(-1)}>&lt;</button>

      <button className="add-friend-text-btn" onClick={() => navigate('/mypage/friends/add')}>
          <img src={addUserIcon} alt="" className="add-friend-icon" />
          <span className="add-friend-text">친구 추가하기</span>
        </button>
      </header>

      <div className="friend-content">
        
        {/* 1. 받은 친구 요청 */}
        <div className="friend-section">
          <div className="section-header" onClick={() => setIsReceivedOpen(!isReceivedOpen)}>
            <div className="section-title-group">
              <img src={receiveIcon} className="section-icon" alt="icon" />
              <span className="section-title">받은 친구 요청</span>
              <span className="section-count">{receivedRequests.length}</span>
            </div>
            <img src={isReceivedOpen ? toggleUp : toggleDown} className="toggle-icon" alt="toggle" />
          </div>
          {isReceivedOpen && (
            <div className="section-list">
              {receivedRequests.length > 0 ? receivedRequests.map(req => (
                <div className="friend-item" key={req.id}>
                  <div className="friend-info" onClick={() => navigate(`/user/${req.senderId}`)}
                    style={{cursor:'pointer'}}>
                    <img src={req.requesterAvatarUrl || defaultProfile} className="friend-img" alt="프사"/>
                    <div className="friend-text">
                      <div className="friend-name">{req.requesterUsername}</div>
                      <div className="friend-tag">#{req.requesterTag}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button onClick={() => handleRespond(req.id, 'REJECT')} className="icon-btn close">
                        <img src={closeIcon} alt="X" />
                    </button>
                    <button onClick={() => handleRespond(req.id, 'ACCEPT')} className="icon-btn check">
                        <img src={checkIcon} alt="O" />
                    </button>
                  </div>
                </div>
              )) : <div className="empty-msg">받은 요청이 없습니다.</div>}
            </div>
          )}
          <div className="section-divider"></div>
        </div>

        {/* 2. 보낸 친구 요청 */}
        <div className="friend-section">
          <div className="section-header" onClick={() => setIsSentOpen(!isSentOpen)}>
            <div className="section-title-group">
              <img src={sendIcon} className="section-icon" alt="icon" />
              <span className="section-title">보낸 친구 요청</span>
              <span className="section-count">{sentRequests.length}</span>
            </div>
            <img src={isSentOpen ? toggleUp : toggleDown} className="toggle-icon" alt="toggle" />
          </div>
          {isSentOpen && (
            <div className="section-list">
              {sentRequests.length > 0 ? sentRequests.map(req => (
                <div className="friend-item" key={req.id}>
                  <div className="friend-info" onClick={() => navigate(`/user/${req.receiverId}`)}
                    style={{cursor:'pointer'}}>
                    <img src={req.avatarUrl || defaultProfile} className="friend-img" alt="프사"/>
                    <div className="friend-text">
                      <div className="friend-name">{req.username}</div>
        
                      {req.tag && <div className="friend-tag">#{req.tag}</div>}
                  </div>
                  </div>
                  <div className="friend-actions">

                      <span className="pending-badge">대기중...</span>
                    
                    <button onClick={() => handleDelete(req.id, 'cancel')} className="icon-btn close">
                        <img src={closeIcon} alt="X" />
                    </button>
                  </div>
                </div>
              )) : <div className="empty-msg">보낸 요청이 없습니다.</div>}
            </div>
          )}
          <div className="section-divider"></div>
        </div>

        {/* 3. 친구 목록 */}
        <div className="friend-section">
          <div className="section-header" onClick={() => setIsFriendOpen(!isFriendOpen)}>
            <div className="section-title-group">
              <img src={friendListIcon} className="section-icon" alt="icon" />
              <span className="section-title">친구 목록</span>
              <span className="section-count">{friends.length}</span>
            </div>
            <img src={isFriendOpen ? toggleUp : toggleDown} className="toggle-icon" alt="toggle" />
          </div>
          {isFriendOpen && (
            <div className="section-list">
              {friends.length > 0 ? friends.map(friend => (
                <div className="friend-item" key={friend.id}>
                  <div className="friend-info" className="friend-info" 
                    onClick={() => navigate(`/user/${friend.id}`)}
                    style={{cursor:'pointer'}}>
                    <img src={friend.avatarUrl || defaultProfile} className="friend-img" alt="프사"/>
                    <div className="friend-text">
                      <div className="friend-name">{friend.username}</div>
                      <div className="friend-tag">#{friend.tag}</div>
                    </div>
                  </div>
                  <div className="friend-actions">
                    <button onClick={() => handleDelete(friend.id, 'friend')} className="icon-btn close">
                        <img src={closeIcon} alt="X" />
                    </button>
                  </div>
                </div>
              )) : <div className="empty-msg">친구가 없습니다.</div>}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}