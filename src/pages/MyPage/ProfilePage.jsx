import React from "react";
import { useNavigate } from "react-router-dom";
import defaultProfile from "../../assets/default-profile.png";
import NavBar from "../../components/NavBar/NavBar";
import "./ProfilePage.css";
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) return <div>로딩 중...</div>;

  // 🔥 안전하게 fallback 적용
  const safeUser = {
    username: user.username || "사용자",
    bio: user.bio || "소개 메시지를 입력하세요",
    profileImage: user.profileImage || defaultProfile,
    postCount: user.postCount ?? 0,
    friendCount: user.friendCount ?? 0,
    albums: user.albums ?? [],   // 🔥 핵심
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

        <div className="profile-username">{safeUser.username}</div>
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
