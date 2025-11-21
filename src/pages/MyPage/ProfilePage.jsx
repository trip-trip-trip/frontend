import React, { useState, useEffect } from "react"; // 👈 useState, useEffect 추가
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.png";

import editIcon from "../../assets/ep_edit.png";

import NavBar from "../../components/NavBar/NavBar";
import "./ProfilePage.css";
import { useAuth } from '../../contexts/AuthContext';

// 1. API_BASE 추가
const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';
export default function ProfilePage() {
   const navigate = useNavigate();
   const { user, token, isLoading } = useAuth(); 
   
   const [postCount, setPostCount] = useState(0); 
   const [tripCount, setTripCount] = useState(0); 
   const [friendCount, setFriendCount] = useState(0); 
   const [myPosts, setMyPosts] = useState([]); 

   useEffect(() => {
     if (!token || !user) return;

     const fetchData = async () => {
       try {
         // 1. [Post] 게시물 목록 가져오기 (썸네일용)
         const postsRes = await fetch(`${API_BASE}/posts?user_id=${user.id}&feed_type=all`, {
           headers: { Authorization: `Bearer ${token}` },
         });
         if (postsRes.ok) {
             const data = await postsRes.json();
             if (data.isSuccess) {
                const posts = data.result.posts || [];
                setMyPosts(posts); 
                setPostCount(posts.length);
             }
         }

         // 2. [Trip] 여행 목록 가져오기 (개수용)
         const tripRes = await fetch(`${API_BASE}/trips`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (tripRes.ok) {
            const tripData = await tripRes.json();
            if (tripData.isSuccess) {
                const trips = tripData.result || [];
                setTripCount(trips.length);
            }
         }

         // 3. [Friend] 친구 목록 가져오기 (개수용)
         const friendRes = await fetch(`${API_BASE}/users/friendships`, { 
            headers: { Authorization: `Bearer ${token}` },
         });
         if (friendRes.ok) {
            const friendData = await friendRes.json();
            if (friendData.isSuccess) {
                const friends = friendData.result || [];
                setFriendCount(friends.length);
            }
         }

       } catch (err) {
         console.error("데이터 로드 실패:", err);
       }
     };

     fetchData();
   }, [token, user?.id]);

   if (isLoading || !user) return <div>로딩 중...</div>;

   const safeUser = {
      username: user.username || "사용자",
      tag: user.tag || "abcd1234",
      bio: user.bio || "소개 메시지가 없습니다.",
      // DB에 이미지가 없으면 기본 이미지
      avatarUrl: user.avatarUrl || defaultProfile, 
   };

   return (
     <div className="profile-page">
       {/* 상단바 */}
       <div className="profile-topbar">
         <button className="back-button" onClick={() => navigate(-1)}>&lt;</button>
         <span className="header-title">프로필</span>
         <button className="settings-button" onClick={() => navigate("/mypage/settings")}>⚙️</button>
       </div>

       {/* 프로필 헤더 */}
       <div className="profile-header">
         <div className="profile-image-wrapper">
           <img 
             src={safeUser.avatarUrl} 
             alt="프로필" 
             className="profile-img" 
             onError={(e) => {e.target.src = defaultProfile;}}
           />
         </div>

         <div className="profile-username">{safeUser.username}</div>
         <div className="profile-bio">{safeUser.bio}</div>

         {/* 프로필 편집 버튼 */}
         <div className="profile-edit-btn-wrap" onClick={() => navigate('/mypage/edit')}>
            <img src={editIcon} alt="edit" className="edit-icon" />
            <span className="profile-edit-text">프로필 편집</span>
         </div>
       </div>

       {/* 통계 섹션 */}
       <div className="profile-stats">
         <div className="stat-item">
           <span className="stat-num">{postCount}</span>
           <span className="stat-label">Post</span>
         </div>
         <div className="stat-item">
           <span className="stat-num">{tripCount}</span>
           <span className="stat-label">Trip</span>
         </div>
         <div className="stat-item" onClick={() => navigate("/mypage/friends")}>
           <span className="stat-num">{friendCount}</span>
           <span className="stat-label">Friend</span>
         </div>
       </div>

       {/* 앨범 그리드 (세로 직사각형 3열) */}
       <div className="album-grid">
         {/* 게시물 추가 버튼 (항상 첫 번째) */}
         <div className="album-item add" onClick={() => navigate("/post_select")}>
           +
         </div>

         {/* 게시물 썸네일 */}
         {myPosts.map((post) => {
           // 썸네일이 없으면 기본 url 사용
           const thumbUrl = post.media?.[0]?.thumbnail_url || post.media?.[0]?.url;
           return (
             <div
               key={post.id}
               className="album-item"
               style={thumbUrl ? { backgroundImage: `url(${thumbUrl})` } : { backgroundColor: '#ccc' }}
               onClick={() => navigate(`/trips/detail`)} // (상세 페이지 ID 연결 필요 시 수정)
             />
           );
         })}
       </div>

       <NavBar current="mypage" />
     </div>
   );
}