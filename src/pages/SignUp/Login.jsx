import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

import welcome_text from '../../assets/Welcome.png'; 
import tripshot_logo from '../../assets/loginLogo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';

import { useAuth } from '../../contexts/AuthContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export default function Login() {
  const navigate = useNavigate();

   const startOAuth = (socialName) => {
    window.location.href = `${API_BASE}/login/start/${socialName}`;
  };
  const {login} = useAuth();
 
  const handleKakao = () => startOAuth("kakao");
  const handleGoogle = () => startOAuth("google");
  const handleNaver = () => startOAuth("naver");

  // // 🔥 2) BE 콜백 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("jwt");
    const level = params.get("level");
    const userStr = params.get("user");

    if (!jwt||!level) return;

    window.history.replaceState({}, document.title, window.location.pathname); 

    let userObj = null;
    if (userStr) {
        try {
            userObj = JSON.parse(decodeURIComponent(userStr));
        } catch(e) {
            console.error("User data parse error:", e);
        }
    }
  
    if (level === "access") {
      //
      login(jwt, userObj);
      navigate("/home", { replace: true });      
      return;
    }

    if (level === "signup") {
      // 전화번호 인증 단계로
      navigate("/phone", {
        state: {
          token: jwt,
          user: userObj,
        }
      });
      return;
    }
  }, [login, navigate]);

  return (
    <main className="login">
      <img src={welcome_text} className="welcome-login" alt="Welcome" />
      <h1 className="lg-title">환영합니다</h1>
      <img src={tripshot_logo} className="logo-login" alt="TripShot" />

      <div className="login-buttons">

        <button className="social-btn kakao-login" onClick={handleKakao}>
          <img src={kakaoLogo} alt="" className="social-icon" />
          카카오 계정으로 계속하기
        </button>

        <button className="social-btn google-login" onClick={handleGoogle}>
          <img src={googleLogo} alt="" className="social-icon" />
          구글 계정으로 계속하기
        </button>

        <button className="social-btn naver-login" onClick={handleNaver}>
          <img src={naverLogo} alt="" className="social-icon" />
          네이버 계정으로 계속하기
        </button>

      </div>
    </main>
  );
}