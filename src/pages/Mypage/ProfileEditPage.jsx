import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import defaultProfile from "../../assets/default-profile.png";
import "./ProfileEditPage.css"; 

// 1. API_BASE 정의
const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function ProfileEditPage() {
   const navigate = useNavigate();
  // 2. token과 'fetchUserProfile' (새로고침용) 함수 가져오기
   const { user, token, fetchUserProfile } = useAuth();

  // 3. state 초기화 (user가 null일 수 있으므로)
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileImage, setProfileImage] = useState(user?.avatarUrl || defaultProfile); // 👈 로컬 미리보기용
  const [privacy, setPrivacy] = useState(user?.privacy || "private"); 
  
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // 4. user 정보가 AuthContext에서 로드되면 state에 반영
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setBio(user.bio || "");
      setProfileImage(user.avatarUrl || defaultProfile);
      // setPrivacy(user.privacy || "private"); // 👈 API 명세서에 privacy 없음
    }
  }, [user]);

  // 5. 이미지 변경 (로컬 미리보기 - 수정 없음)
   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result); // 로컬 state (미리보기) 업데이트
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

   // 6. [핵심] "수정완료" 버튼 클릭 (API 연동)
   const handleSave = async () => {
    if (!token) {
      alert("로그인 정보가 없습니다.");
      return;
    }
    setIsLoading(true);

    // 7. PATCH /users/me API로 보낼 데이터
    const patchData = {
      username: username,
      bio: bio,
    };

    //  TODO: 이미지 업로드 로직
    // 1. "새로운 프로필 이미지" API (예: POST /media/upload/profile) 호출
    // 2. 응답으로 URL(newUrl)을 받음
    // 3. patchData.avatarUrl = newUrl;
    //

      try {
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(patchData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "서버 오류로 수정에 실패했습니다.");
      }

     if (fetchUserProfile) {
        await fetchUserProfile(token); 
      }
      alert("프로필이 성공적으로 수정되었습니다.");
      navigate('/mypage/profile'); // 프로필 페이지로 복귀

    } catch (err) {
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }

   };

   return (
      <div className="profile-edit-page">
         <header className="edit-header">
            <button className="back-button" onClick={() => navigate(-1)}>
               &lt;
            </button>
            <h2 className="header-title">프로필 수정</h2>
            <button 
          className="save-button" 
          onClick={handleSave} 
          disabled={isLoading} // 👈 로딩 시 비활성화
        >
               {isLoading ? "저장 중..." : "수정완료"}
            </button>
         </header>

      {/* ... (나머지 JSX는 기존 코드와 동일) ... */}
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

 