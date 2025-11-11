import React, { useState } from "react"; 
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.png";
import NavBar from "../../components/NavBar/NavBar";
import "./ProfilePage.css";
import {useAuth} from '../../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
 const { user } = useAuth(); // 2. Context에서 '실제' user 데이터 가져오기

  // 3. 사용자가 없으면(로그인 안 됨) 로딩 중... 또는 로그인 페이지로 리디렉션
  if (!user) {
    // navigate('/login'); // (선택)
    return <div>로딩 중...</div>; 
  }
  const profileImage = user.profileImage || defaultProfile;

  return (
    <div className="profile-page">
      {/* 상단바 */}
      <div className="profile-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2 className="header-title">프로필</h2>
        <button className="settings-button" onClick={() => navigate("/mypage/settings")}>
          ⚙️
        </button>
      </div>

      {/* 프로필 정보 */}
      <div className="profile-header">
        <div className="profile-image-wrapper">
          <img
            src={profileImage || defaultProfile}
            alt="프로필"
            className="profile-img"
            // 3. onClick 핸들러 삭제
          />
        </div>

        {/* 4. 중복 방지: username/bio는 여기에만 있어야 함 */}
        <div className="profile-username">{user.username}</div>
        <div className="profile-bio">{user.bio || "소개 메시지를 입력하세요"}</div>

        <button
          className="profile-edit-button"
          onClick={() => navigate('/mypage/edit')}
        >
          프로필 수정
        </button>
      </div>

      {/* 5. 불필요한 input 태그 및 중복 username/bio, 
             잘못된 </div> 태그 모두 삭제 */}

      {/* 업로드 / 친구 */}
      <div className="profile-stats">
        <div>
          <strong>{user.postCount || "27"}</strong>
          <span>여행</span>
        </div>
        <div onClick={() => navigate("/mypage/friends")}>
          <strong>{user.friendCount || "156"}</strong>
          <span>친구</span>
        </div>
      </div>

      {/* 앨범 */}
      <div className="album-grid">
        {user.albums.map((album, i) => (
          <div
            key={i}
            className="album-item"
            style={{ backgroundColor: album.color }}
          ></div>
        ))}
        <div className="album-item add" onClick={() => navigate("/posting")}>
          +
        </div>
      </div>

      {/* 하단 네비게이션바 */}
      <NavBar current="mypage" />
    </div>
  );
}