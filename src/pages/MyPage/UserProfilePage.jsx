import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfilePage.css';

// 아이콘 및 이미지
import backIcon from '../../assets/back.png';
import defaultProfile from '../../assets/default-profile.png';
import lockIcon from '../../assets/lock.png'; 
import requestIcon from '../../assets/add_user.png'; 
import rejectIcon from '../../assets/close_icon.png'; 

const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function UserProfilePage() {
  const { userId } = useParams(); 
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [userInfo, setUserInfo] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [counts, setCounts] = useState({
    post: 0,
    trip: 0,
    friend: 0
  });

  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-Id': user?.id ? String(user.id) : '',
  });

useEffect(() => {
    if (token && userId) {
      fetchUserProfile();// 통계 및 게시물 가져오기 실행
    }
  }, [token, userId]);

  // 1. 프로필 기본 정보 (이름, 소개글, 친구여부 등)
  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}/users/${userId}/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      const data = await res.json();

      if (data.isSuccess) {
        console.log(" 프로필 정보:", data.result); // 디버깅용
        const profile = data.result;
        setUserInfo(profile);
        setCounts({
        post: profile.postCount ?? 0,
        trip: profile.tripCount ?? 0,
        friend: profile.friendCount ?? 0
      });
        // 친구 여부 및 본인 여부 확인
        
        // 친구거나 나일 때만 통계/게시물 데이터를 가져옴
        if (profile.isMe || profile.isFriend) {
        fetchPosts();
      }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
// const fetchStatsAndPosts = async () => {
//     try {
//         // (1) [Post] 게시물 목록 및 개수
//         // API: /posts?user_id={userId}&feed_type=profile
//         const postsRes = await fetch(`${API_BASE}/posts?user_id=${userId}&feed_type=profile`, {
//             headers: getHeaders(),
//         });
//         if (postsRes.ok) {
//             const data = await postsRes.json();
//             if (data.isSuccess) {
//                 const posts = data.result.posts || [];
//                 setUserPosts(posts); // 앨범 그리드용 리스트 저장
//                 setCounts(prev => ({ ...prev, post: posts.length })); // 개수 저장
//             }
//         }

//         // (2) [Trip] 여행 목록 및 개수
//         // API: /trips?user_id={userId}
//         const tripRes = await fetch(`${API_BASE}/trips?user_id=${userId}`, {
//             headers: getHeaders(),
//         });
//         if (tripRes.ok) {
//             const tripData = await tripRes.json();
//             if (tripData.isSuccess) {
//                 const trips = tripData.result || [];
//                 setCounts(prev => ({ ...prev, trip: trips.length })); // 개수 저장
//             }
//         }

//         // (3) [Friend] 친구 목록 및 개수
//         // API: /users/friendships?user_id={userId}
//         const friendRes = await fetch(`${API_BASE}/users/friendships?user_id=${userId}`, { 
//             headers: getHeaders(),
//         });
//         if (friendRes.ok) {
//             const friendData = await friendRes.json();
//             if (friendData.isSuccess) {
//                 const friends = friendData.result || [];
//                 setCounts(prev => ({ ...prev, friend: friends.length })); // 개수 저장
//             }
//         }

//     } catch (err) {
//         console.error("통계 데이터 로드 실패:", err);
//     }
//   };
  const fetchPosts = async () => {
  const res = await fetch(`${API_BASE}/posts?user_id=${userId}&feed_type=profile`, {
    headers: getHeaders(),
  });

  const data = await res.json();
  if (data.isSuccess) {
    setUserPosts(data.result.posts || []);
  }
};


const sendRequest = async () => {
    try {
      const res = await fetch(`${API_BASE}/friendships/requests`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ targetUserId: Number(userId) }),
      });
      const data = await res.json();
      
      if (data.isSuccess) {
        alert("친구 요청을 보냈습니다.");
        setUserInfo(prev => ({ ...prev, pendingSent: true }));
      } else {
        alert(data.message); // "Already friends" 같은 메시지가 뜸
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading-msg">로딩 중...</div>;
  if (!userInfo) return <div className="error-msg">사용자를 찾을 수 없습니다.</div>;


  const isMe = Boolean(userInfo.me || userInfo.isMe); 
  const isFriend = Boolean(userInfo.friend || userInfo.isFriend); 

  // 친구도 아니고 나도 아니면 -> 잠금 화면
  const showLockScreen = !isFriend && !isMe;

  const visiblePosts = userPosts.filter(post => {
    if (isMe) return true; 
    if (isFriend) {
       return post.visibility === 'FRIENDS' || post.visibility === 'PUBLIC';
    }
    return false; 
  });

  return (
    <div className="profile-page">
      
      {/* 1. 헤더 */}
      <div className="profile-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          <img src={backIcon} alt="back" style={{width: 24, height: 24}} /> 
        </button>
        <div style={{width: 24}}></div> 
      </div>

      {/* 2. 프로필 정보 박스 */}
      <div className="profile-info-box">
        <div className="profile-image-wrapper">
           <img 
             src={userInfo.avatarUrl || defaultProfile} 
             alt="프로필" 
             className="profile-img"
             onError={(e) => {e.target.src = defaultProfile;}}
           />
        </div>

        <div className="profile-details">
           <div className="profile-username">{userInfo.username}</div>
           <div className="profile-userid">#{userInfo.tag}</div>
           
           <div className="profile-stats">
              <div className="stat-item">
                 <span className="stat-num">{counts.post || 0}</span>
                 <span className="stat-label">Post</span>
              </div>
              <div className="stat-item">
                 <span className="stat-num">{counts.trip || 0}</span>
                 <span className="stat-label">Trip</span>
              </div>
              <div className="stat-item">
                 <span className="stat-num">{counts.friend|| 0}</span>
                 <span className="stat-label">Friend</span>
              </div>
           </div>

           <div className="profile-bottom-row">
              <div className="profile-bio">{userInfo.bio || "소개글이 없습니다."}</div>
              
              {!isMe && !isFriend && (
                <div className="profile-action-wrapper">
                  {userInfo.pendingSent ? (
                    <button className="status-btn sent">요청됨</button>
                  ) : userInfo.pendingReceived ? (
                    <button className="status-btn received">수락 대기</button>
                  ) : (
                    <button className="request-icon-btn" onClick={sendRequest}>
                       <img src={requestIcon} alt="친구 추가" />
                    </button>
                  )}
                </div>
              )}
           </div>
        </div>
      </div>

      {/* 3. 컨텐츠 영역 */}
      {showLockScreen ? (
        /* [잠금 화면] */
        <div className="private-lock-screen">
          <img src={lockIcon} className="lock-icon" alt="locked" />
          <p className="lock-message">
            {userInfo.username} 님과 친구가 되면 포스트를 볼 수 있어요!
          </p>
        </div>
      ) : (
        /* [공개 화면] */
        <div className="album-grid">
          {isMe && (
            <div className="album-item add" onClick={() => navigate("/post_select")}>+</div>
          )}
          
          {visiblePosts.length > 0 ? (
            visiblePosts.map((post) => {
              const thumbUrl = post.media?.[0]?.thumbnailUrl || post.media?.[0]?.url || post.media?.[0]?.thumbnail_url;
              return (
                <div
                  key={post.id}
                  className="album-item"
                  style={thumbUrl ? { backgroundImage: `url(${thumbUrl})` } : { backgroundColor: '#ccc' }}
                  onClick={() => navigate(`/post/${post.id}`)} 
                />
              );
            })
          ) : (
            !isMe && <div className="empty-feed-msg">게시물이 없습니다.</div>
          )}
        </div>
      )}
    </div>
  );
}