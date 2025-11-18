import React, { useState, useEffect } from "react"; // 👈 useState, useEffect 추가
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.png";
import NavBar from "../../components/NavBar/NavBar";
import "./ProfilePage.css";
import { useAuth } from '../../contexts/AuthContext';

// 1. API_BASE 추가
const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function ProfilePage() {
   const navigate = useNavigate();
   const { user, token, isLoading } = useAuth(); // 👈 token, isLoading 가져오기
  const [postCount, setPostCount] = useState(0); // 👈 [신규] 여행(게시물) 갯수

  const [friendCount, setFriendCount] = useState(0); 

  // 2. [신규] GET /users/me/posts API 호출
  useEffect(() => {
    if (!token) return; // 토큰 없으면 중지

    const fetchUserPosts = async () => {
      try {
        const res = await fetch(`${API_BASE}/users/me/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("게시물 로드 실패");
        
        // 🚨 API 명세서의 응답 형식 { "data": { "posts": [...] } } 기준
        // 🚨 만약 { "posts": [...] } 라면 data.posts.length로 수정
        const data = await res.json();
        if (data.data && data.data.posts) {
          setPostCount(data.data.posts.length);
        } else if (data.posts) { // 예비 케이스
           setPostCount(data.posts.length);
        }
      } catch (err) {
        console.error("게시물 수 로드 실패:", err);
      }
    };

    fetchUserPosts();
  }, [token]); // 👈 token이 준비되면 실행

  // 3. [수정] 로딩 처리
   if (isLoading || !user) return <div>로딩 중...</div>;

   // 4. [수정] safeUser를 API 명세서 키(avatarUrl 등)에 맞춤
   const safeUser = {
      username: user.username || "사용자",
      tag: user.tag || "abcd1234", // 👈 API 필드 추가
      bio: user.bio || "소개 메시지를 입력하세요",
      avatarUrl: user.avatarUrl || defaultProfile, // 👈 profileImage -> avatarUrl
      postCount: postCount, // 👈 [수정] API에서 가져온 갯수
      friendCount: friendCount, // 👈 [수정] API가 없으므로 임시 state
      albums: [], // 👈 [수정] API가 없으므로 임시 []
   };

   return (
      <div className="profile-page">
       <div className="profile-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2 className="header-title">프로필</h2>
        <button className="settings-button" onClick={() => navigate("/mypage/settings")}>
          ⚙️
        </button>
      </div>
<div className="profile-header">
        <div className="profile-image-wrapper">
          <img src={safeUser.profileImage} className="profile-img" />
        </div>

        {/* 6. [추가] @태그 */}
            <div className="profile-username">{safeUser.username}</div>
        <div className="profile-tag">@{safeUser.tag}</div> 
            <div className="profile-bio">{safeUser.bio}</div>

            <button
               className="profile-edit-button"
               onClick={() => navigate('/mypage/edit')}
            >
               프로필 수정
            </button>
         </div>

         <div className="profile-stats">
            <div>
          {/* 7. [수정] postCount */}
               <strong>{safeUser.postCount}</strong>
               <span>여행</span>
            </div>
            <div onClick={() => navigate("/mypage/friends")}>
               <strong>{safeUser.friendCount}</strong>
               <span>친구</span>
            </div>
         </div>

         <div className="album-grid">
            {safeUser.albums.map((album, i) => (
               <div key={i} className="album-item" style={{ backgroundColor: album.color }} />
            ))}
            <div className="album-item add" onClick={() => navigate("/posting")}>+</div>
         </div>

         <NavBar current="mypage" />
      </div>
   );
}
