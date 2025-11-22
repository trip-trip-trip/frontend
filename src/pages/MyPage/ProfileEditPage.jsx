import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import defaultProfile from "../../assets/default-profile.png";
import editIcon from "../../assets/ep_edit.png"; // ⚠️ [확인] 아이콘 경로
import "./ProfileEditPage.css"; 

const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function ProfileEditPage() {
   const navigate = useNavigate();
   const { user, token, fetchUserProfile } = useAuth();

   const [username, setUsername] = useState(user?.username || "");
   const [bio, setBio] = useState(user?.bio || "");
   const [profileImage, setProfileImage] = useState(user?.avatarUrl || defaultProfile); 
   const [imageFile, setImageFile] = useState(null); 
   const [privacy, setPrivacy] = useState(user?.privacy || "public"); // 기본값 public
   
   const [isLoading, setIsLoading] = useState(false);
   const fileInputRef = useRef(null);
   const cameraInputRef = useRef(null);
   const [menuOpen, setMenuOpen] = useState(false);

   useEffect(() => {
     if (user) {
       setUsername(user.username || "");
       setBio(user.bio || "");
       setProfileImage(user.avatarUrl || defaultProfile);
     }
   }, [user]);

   const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setImageFile(file); 
      const reader = new FileReader();
      reader.onloadend = () => setProfileImage(reader.result); 
      reader.readAsDataURL(file);
      setMenuOpen(false);
   };

   
const handleCameraClick = () => {
     cameraInputRef.current.click();
     setMenuOpen(false);
   };

   const handleDeleteImage = () => {
     setProfileImage(defaultProfile); 
     setImageFile(null); 
     setMenuOpen(false);
   };
   const handleSave = async () => {
    if (!token) {
      alert("로그인 정보가 없습니다.");
      return;
    }
    setIsLoading(true);

    try {
      // 1. FormData 생성
      const formData = new FormData();

      // 2. 이미지 파일이 변경되었다면 'file' 키에 추가
      if (imageFile) {
        formData.append("file", imageFile);
      }

      // 3. 나머지 텍스트 데이터(JSON)를 'data' 키에 Blob으로 추가
      // (백엔드가 요구하는 방식: File은 file에, 나머지는 data에)
      const updateData = {
        username: username,
        bio: bio,
        // tag: user.tag // 태그도 수정 가능하다면 추가
      };

      // 🚨 중요: JSON을 Blob으로 감싸고 type을 application/json으로 지정해야 백엔드가 인식함
      formData.append("data", new Blob([JSON.stringify(updateData)], { type: "application/json" }));

      // 4. PATCH 요청 전송
      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          // 'Content-Type': 'multipart/form-data', // ⚠️ 주의: 이 헤더는 직접 설정하면 안 됩니다! 브라우저가 자동으로 설정함.
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok || !data.isSuccess) {
        // 태그 중복 등 에러 처리
        throw new Error(data.message || "프로필 수정 실패");
      }

      // 5. 수정 성공 시 내 정보 갱신
      if (fetchUserProfile) {
        await fetchUserProfile(token); 
      }
      
      alert("프로필이 수정되었습니다.");
      navigate('/mypage/profile'); 

    } catch (err) {
      console.error(err);
      alert(`저장 실패: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
   };

   return (
      <div className="profile-edit-page">
         {/* 1. 헤더 (왼쪽 정렬 제목 + 아이콘) */}
         <header className="edit-header">
            <div className="header-left">
                <button className="back-button" onClick={() => navigate(-1)}>&lt;</button>
                <div className="header-title">
                    <img src={editIcon} alt="" className="header-icon" />
                    프로필 수정
                </div>
            </div>
            <button className="save-button" onClick={handleSave} disabled={isLoading}>
               {isLoading ? "..." : "수정 완료"}
            </button>
         </header>
<main className="edit-content">
            <section className="edit-image-section">
               <img src={profileImage} alt="프로필" className="profile-img" onError={(e)=>e.target.src=defaultProfile}/>
               <button className="change-image-button" onClick={() => setMenuOpen(true)}>
                  새로운 프로필 이미지
               </button>
               {menuOpen && (
                  <div className="profile-menu active">
                     <button onClick={() => fileInputRef.current.click()}>앨범에서 선택</button>
                     <button onClick={handleCameraClick}>사진 찍기</button>
                     <button onClick={handleDeleteImage} className="delete">기본 이미지로 변경</button>
                     <button onClick={() => setMenuOpen(false)} className="cancel">취소</button>
                  </div>
               )}
            </section>

            {/* 3. 폼 섹션 */}
            <section className="edit-form-section">
               <div className="form-group">
                  <label htmlFor="username">아이디 이름</label>
                  <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
               </div>
               <div className="form-group">
                  <label htmlFor="bio">프로필 소개</label>
                  <input id="bio" type="text" value={bio} onChange={(e) => setBio(e.target.value)} />
               </div>
            </section>

          
         </main>

         {/* 팝업 메뉴 */}
         {menuOpen && (
            <>
                <div className="modal-overlay" onClick={() => setMenuOpen(false)} style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.3)', zIndex:99}} />
                <div className="profile-menu active">
                    <button onClick={() => fileInputRef.current.click()}>앨범에서 선택</button>
                    <button onClick={() => {cameraInputRef.current.click(); setMenuOpen(false);}}>사진 찍기</button>
                    <button onClick={() => {setProfileImage(defaultProfile); setImageFile(null); setMenuOpen(false);}} className="delete">기본 이미지로 변경</button>
                    <button onClick={() => setMenuOpen(false)} className="cancel">취소</button>
                </div>
            </>
         )}
         <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
         <input type="file" accept="image/*" capture="user" ref={cameraInputRef} style={{ display: "none" }} onChange={handleImageChange} />
      </div>
   );
}