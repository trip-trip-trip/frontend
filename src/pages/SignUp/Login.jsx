import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import './StartPage.css';
import welcome_text from '../../assets/Welcome.png'; 
import tripshot_logo from '../../assets/loginLogo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';
import splashLogo from '../../assets/firstpage.png';

import { useAuth } from '../../contexts/AuthContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showSplash, setShowSplash] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // 소셜 로그인 콜백으로 돌아온 경우 바로 끄기
    const params = new URLSearchParams(window.location.search);
    if (params.get("jwt")) {
      setShowSplash(false);
      return;
    }

    //1.5초 뒤에 페이드 아웃 시작 
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 1500);

    //페이드 아웃 시간(0.8초)만큼 더 기다렸다가 아예 없애기 
    const removeTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2300);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const startOAuth = (socialName) => {
    window.location.href = `${API_BASE}/login/start/${socialName}`;
  };
  const handleKakao = () => startOAuth("kakao");
  const handleGoogle = () => startOAuth("google");
  const handleNaver = () => startOAuth("naver");

  // BE 콜백 처리
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const jwt = params.get("jwt");
    const level = params.get("level");
    const userStr = params.get("user");

    if (!jwt || !level) return;

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
      login(jwt, userObj);
      navigate("/home", { replace: true });      
      return;
    }

    if (level === "signup") {
      navigate("/phone", {
        state: { token: jwt, user: userObj }
      });
      return;
    }
  }, [login, navigate]);


  return (
    <main className="login">
      {showSplash && (
        <div className={`splash-overlay ${isFading ? 'fade-out' : ''}`}>
           <img
            src={splashLogo}
            alt="TripShot Main"
            className="logo" // StartPage.css의 스타일 유지
            draggable="false"
          />
        </div>
      )}

      {/* 로그인 화면 (뒤에 깔려있음) */}
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