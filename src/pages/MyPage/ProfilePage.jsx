import React, { useState, useEffect } from "react"; // 👈 useState, useEffect 추가
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.png";

 import logoTop from '../../assets/logoTop.png';
import editIcon from "../../assets/ep_edit.png";
import settingIcon from '../../assets/setting.png';

import NavBar from "../../components/NavBar/NavBar";
import "./ProfilePage.css";
import { useAuth } from '../../contexts/AuthContext';

// 1. API_BASE 추가
const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';
export default function ProfilePage() {
   const navigate = useNavigate();
   const { user, token, isLoading ,setUser} = useAuth(); 
   
   const [postCount, setPostCount] = useState(0); 
   const [tripCount, setTripCount] = useState(0); 
   const [friendCount, setFriendCount] = useState(0); 
   const [myPosts, setMyPosts] = useState([]); 

   useEffect(() => {
     if (!token || !user) return;

     const fetchData = async () => {
       try {
         // 1. [Post] 게시물 목록 가져오기 (썸네일용)
         const postsRes = await fetch(`${API_BASE}/posts?user_id=${user.id}&feed_type=profile`, {
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
         }const profileRes = await fetch(`${API_BASE}/users/me`, {
            headers: { Authorization: `Bearer ${token}` },
         });
         if (profileRes.ok) {
            const profileData = await profileRes.json();
            if (profileData.isSuccess) {
                setUser(profileData.result); 
                localStorage.setItem("user", JSON.stringify(profileData.result));
            }
         }
       } catch (err) {
         console.error("데이터 로드 실패:", err);
       }
     };
     fetchData();
   }, [token, user?.id, setUser]);

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
       {/* 1. [수정] 상단바: 왼쪽 로고 / 오른쪽 설정 아이콘 */}
       <div className="profile-topbar">
         <img 
           src={logoTop} 
           alt="TripShot" 
           className="topbar-logo" 
           onClick={() => navigate('/home')} // 로고 누르면 홈으로
         />
         <button className="settings-button" onClick={() => navigate("/mypage/settings")}>
           <img src={settingIcon} alt="설정" className="settings-icon" />
         </button>
       </div>

       {/* 2. 프로필 정보 박스 */}
       <div className="profile-info-box">
         <div className="profile-image-wrapper">
           <img 
             src={safeUser.avatarUrl} 
             alt="프로필" 
             className="profile-img-my" 
             onError={(e) => {e.target.src = defaultProfile;}}
           />
         </div>

         <div className="profile-details">
            <div className="profile-username">{safeUser.username}</div>
            <div className="profile-userid">#{safeUser.tag}</div>
            
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

            <div className="profile-bottom-row">
               <div className="profile-bio">{safeUser.bio}</div>
               
               <div className="profile-edit-btn-wrap" onClick={() => navigate('/mypage/edit')}>
                  <img src={editIcon} alt="edit" className="edit-icon" />
                  <span className="profile-edit-text">프로필 수정</span>
               </div>
            </div>
         </div>
       </div>

       {/* 3. 앨범 그리드 */}
       <div className="album-grid">
         <div className="album-item add" onClick={() => navigate("/post/create")}>+</div>
         
         {myPosts.map((post) => {
           const thumbUrl = post.media?.[0]?.thumbnail_url || post.media?.[0]?.url;
           return (
             <div
               key={post.id}
               className="album-item"
               style={thumbUrl ? { backgroundImage: `url(${thumbUrl})` } : { backgroundColor: '#ccc' }}
               onClick={() => navigate(`/post/${post.id}`)} 
             />
           );
         })}
       </div>

       <NavBar current="mypage" />
     </div>
   );
}