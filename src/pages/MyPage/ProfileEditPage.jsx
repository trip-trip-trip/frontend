import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import defaultProfile from "../../assets/default-profile.png";
import "./ProfileEditPage.css"; 

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

const [username, setUsername] = useState(user.username);
const [bio, setBio] = useState(user.bio || ""); // 카카오에 bio가 없으므로 빈 문자열로 초기화
const [profileImage, setProfileImage] = useState(user.profileImage || "");
const [privacy, setPrivacy] = useState(user.privacy || "private"); // (user에 privacy가 없다면 기본값 private)
const fileInputRef = useRef(null);
const cameraInputRef = useRef(null);
const [menuOpen, setMenuOpen] = useState(false);
  if (!user) {
    return <div>로딩 중...</div>;
  }
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result); // state 업데이트
    reader.readAsDataURL(file);
    setMenuOpen(false);
  };

  const handleCameraClick = () => {
    cameraInputRef.current.click();
    setMenuOpen(false);
  };

  const handleDeleteImage = () => {
    setProfileImage(""); // state 업데이트
    setMenuOpen(false);
  };

  // 3. "수정완료" 버튼 클릭 시 (지금은 콘솔에만 출력)
 const handleSave = () => {
    // 6. setUser 함수 호출 (이게 핵심!)
    setUser({
      ...user, // 앨범, 친구 수 등 기존 Context 정보는 유지
      username: username, // 로컬 state의 값으로 덮어쓰기
      bio: bio,
      profileImage: profileImage,
      privacy: privacy,
    });
    console.log("저장 프로필");
    // TODO: 여기에 BE로 전송하는 API 로직 추가
    
    // 저장이 완료되면 프로필 페이지로 복귀
    navigate('/mypage/profile'); 
  };

  return (
    <div className="profile-edit-page">
      {/* 상단바 */}
      <header className="edit-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2 className="header-title">프로필 수정</h2>
        <button className="save-button" onClick={handleSave}>
          수정완료
        </button>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="edit-content">
        {/* 1. 프로필 이미지 섹션 */}
        <section className="edit-image-section">
          <img
            src={profileImage || defaultProfile}
            alt="프로필"
            className="profile-img"
          />
          <button 
            className="change-image-button" 
            onClick={() => setMenuOpen(true)}
          >
            새로운 프로필 이미지
          </button>
          
          {/* 이미지 변경 팝업  */}
          {menuOpen && (
            <div className="profile-menu active"> {/* 항상 보이도록 active 추가 */}
              <button onClick={() => fileInputRef.current.click()}>앨범에서 선택</button>
              <button onClick={handleCameraClick}>사진 찍기</button>
              <button onClick={handleDeleteImage} className="delete">
                삭제하기
              </button>
              <button onClick={() => setMenuOpen(false)} className="cancel">
                취소
              </button>
            </div>
          )}
        </section>

        {/* 숨겨진 input 태그들 */}
        <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
        <input type="file" accept="image/*" capture="user" ref={cameraInputRef} style={{ display: "none" }} onChange={handleImageChange} />

        {/* 2. 폼 섹션 */}
        <section className="edit-form-section">
          <div className="form-group">
            <label htmlFor="username">아이디 이름</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">프로필 소개</label>
            <input
              id="bio"
              type="text"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
        </section>

        {/* 3. 공개 범위 섹션 */}
        <section className="edit-privacy-section">
          <h3>프로필 공개 범위</h3>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="privacy"
                value="public"
                checked={privacy === "public"}
                onChange={(e) => setPrivacy(e.target.value)}
              />
              공개
            </label>
          </div>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="privacy"
                value="private"
                checked={privacy === "private"}
                onChange={(e) => setPrivacy(e.target.value)}
              />
              비공개
            </label>
          </div>
        </section>
      </main>
    </div>
  );
}