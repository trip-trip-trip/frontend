import React ,{useRef,useState,useEffect} from "react";
//하단 navbar import
import {useNavigate} from "react-router-dom";
import "./MyPage.css";
import dummyUser from "./dummyUser";
import defaultProfile from "../../assets/default-profile.png";
import "./ProfilePage.css"

export default function ProfilePage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null); 
    const [user] = useState(dummyUser);
    const [profileImage, setProfileImage] = useState(user.profileImage||"");
    const [menuOpen, setMenuOpen] = useState(false);
  


 const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (!file) return; // 파일이 없으면 중단

    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result);
    reader.readAsDataURL(file);

    setMenuOpen(false);
  };

    // 사진 찍기 (카메라 열기)
const handleCameraClick = () => {
    cameraInputRef.current.click(); // 네이티브 카메라 앱 열기
    setMenuOpen(false);
  };

  // 프사 삭제하기
  const handleDeleteImage = () => {
    setProfileImage("");
    setMenuOpen(false);
  };

   useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-img") && !e.target.closest(".profile-menu")) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);


return (
    // 👇 [수정] .mypage 클래스 대신 .profile-page만 사용 (CSS에서 높이 100% 제어)
    <div className="profile-page">
      {/* 상단바 */}
      <div className="profile-topbar">
        <button className="back-button" onClick={() => navigate(-1)}>
          &lt;
        </button>
        <h2 className="header-title">프로필</h2>
        <button className="settings-button" onClick={() => navigate("/mypage/settings")}>
          {/* ⚙️ 아이콘을 SVG나 이미지로 변경하는 것을 권장 */}
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
            onClick={() => setMenuOpen(!menuOpen)}
          />
          {menuOpen && (
            <div className="profile-menu">
              <button onClick={() => fileInputRef.current.click()}>앨범에서 선택</button>
              <button onClick={handleCameraClick}>사진 찍기</button>
              <button onClick={handleDeleteImage} className="delete">
                삭제하기
              </button>
            </div>
          )}
        </div>

        {/* 1. 앨범(갤러리)용 숨겨진 input */}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange}
        />
        {/* 2. 카메라용 숨겨진 input (새로 추가) */}
        <input
          type="file"
          accept="image/*"
          capture="user" // 'user': 셀카, 'environment': 후면
          ref={cameraInputRef}
          style={{ display: "none" }}
          onChange={handleImageChange} // 앨범과 동일한 핸들러 사용
        />

        <div className="profile-username">{user.username}</div>
        <div className="profile-bio">{user.bio || "여행을 사랑하는 사람"}</div>
      </div>

      {/* 업로드 / 친구 */}
      <div className="profile-stats">
        <div>
          <strong>{user.postCount || "27"}</strong>
          {/* 피그마 디자인에 "여행"으로 되어있네요 */}
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

      {/* 하단 네비게이션바가 있다면 그 높이만큼 공간 확보 */}
      {/* <div className="nav-placeholder"></div> */}
      {/* (하단 네비게이션은 App.jsx에서 관리하는 것이 더 좋습니다) */}
    </div>
  );
}
