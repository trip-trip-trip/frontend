import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../../contexts/AuthContext';
import defaultProfile from "../../assets/default-profile.png";
import editIcon from "../../assets/ep_edit.png"; // 아이콘
import backIcon from "../../assets/back.png"; // 뒤로가기 아이콘
import NavBar from "../../components/NavBar/NavBar"; // 네비게이션 바
import "./ProfileEditPage.css"; 

const API_BASE = import.meta.env.PROD 
   ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
   : '/api';

export default function ProfileEditPage() {
   const navigate = useNavigate();
   const { user, token, fetchUserProfile } = useAuth();

   const [username, setUsername] = useState("");
   const [tag, setTag] = useState(""); // ID(Tag) 상태 추가
   const [bio, setBio] = useState("");
   const [profileImage, setProfileImage] = useState(defaultProfile); 
   const [imageFile, setImageFile] = useState(null); 
   
   const [isLoading, setIsLoading] = useState(false);
   const fileInputRef = useRef(null);
   const cameraInputRef = useRef(null);
   const [menuOpen, setMenuOpen] = useState(false);

   // 초기 데이터 로드
   useEffect(() => {
     if (user) {
       setUsername(user.username || "");
       setTag(user.tag || ""); // 초기 태그 설정
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
    if (!token) return alert("로그인 정보가 없습니다.");
    
    if (!username.trim()) return alert("이름을 입력해주세요.");
    if (!tag.trim()) return alert("ID를 입력해주세요.");

    setIsLoading(true);

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append("file", imageFile);
      }

      const updateData = {
        username: username,
        tag: tag, // 수정된 ID(Tag) 전송
        bio: bio,
      };

      formData.append("data", new Blob([JSON.stringify(updateData)], { type: "application/json" }));

      const res = await fetch(`${API_BASE}/users/me`, {
        method: "PATCH",
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      
      if (!res.ok || !data.isSuccess) {
        throw new Error(data.message || "프로필 수정 실패");
      }

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
         {/* 1. 헤더 */}
         <header className="edit-header">
            <button className="back-button" onClick={() => navigate(-1)}>
                <img src={backIcon} alt="back" style={{width: 24, height: 24}}/>
            </button>
            {/* 중앙 정렬을 위한 여백 */}
         </header>

         <main className="edit-content">
            {/* 2. 이미지 섹션 */}
            <div className="page-title-area" style={{ textAlign: 'left', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', fontSize: '18px' }}>
            <img src={editIcon} alt="" className="header-icon" style={{ width: '24px', height: '24px' }} />
            프로필 수정
         </div>
            <section className="edit-image-section">
               <div className="image-wrapper">
                   <img src={profileImage} alt="프로필" className="profile-img" onError={(e)=>e.target.src=defaultProfile}/>
               </div>
               {/* 피그마처럼 텍스트 버튼으로 변경 */}
               <div className="change-image-text" onClick={() => setMenuOpen(true)}>
                  사진 바꾸기
               </div>

               {/* 이미지 변경 팝업 */}
               {menuOpen && (
                  <>
                    <div className="modal-overlay" onClick={() => setMenuOpen(false)} />
                    <div className="profile-menu active">
                       <button onClick={() => fileInputRef.current.click()}>앨범에서 선택</button>
                       <button onClick={handleCameraClick}>사진 찍기</button>
                       <button onClick={handleDeleteImage} className="delete">기본 이미지로 변경</button>
                       <button onClick={() => setMenuOpen(false)} className="cancel">취소</button>
                    </div>
                  </>
               )}
            </section>

            {/* 3. 입력 폼 섹션 */}
            <section className="edit-form-section">
               <div className="form-group">
                  <label htmlFor="username">이름</label>
                  <input 
                    id="username" 
                    type="text" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)} 
                    placeholder="이름을 입력하세요"
                  />
               </div>

               <div className="form-group">
                  <label htmlFor="tag">ID</label>
                  <input 
                    id="tag" 
                    type="text" 
                    value={tag} 
                    onChange={(e) => setTag(e.target.value)} 
                    placeholder="아이디를 입력하세요"
                  />
                </div>

               <div className="form-group">
                  <label htmlFor="bio">소개글</label>
                  <input 
                    id="bio" 
                    type="text" 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder="소개글을 입력하세요"
                  />
               </div>

               {/* 4. 저장하기 버튼 (폼 아래 배치) */}
               <button className="bottom-save-button" onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "저장 중..." : "저장하기"}
               </button>
            </section>
         </main>

         {/* hidden inputs */}
         <input type="file" accept="image/*" ref={fileInputRef} style={{ display: "none" }} onChange={handleImageChange} />
         <input type="file" accept="image/*" capture="user" ref={cameraInputRef} style={{ display: "none" }} onChange={handleImageChange} />

         <NavBar current="mypage" />
      </div>
   );
}