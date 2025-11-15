import React, { useEffect, useCallback } from 'react'; 
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import welcome_text from '../../assets/Welcome.png'; 
import tripshot_logo from '../../assets/loginLogo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';
import { useAuth } from '../../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;

const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, ''); 
const REDIRECT_URI = `${window.location.origin}/login`;

function decodeJwt(idToken) {
  try {
    const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithKakao, loginWithGoogle } = useAuth(); 

  // 신규 유저 이동 처리
  const afterSocialLogin = useCallback(
    (provider, token, accountPreview = {}) => {
      const devTicket = `dev-${provider}-${Date.now()}`;
      sessionStorage.setItem('auth.provider', provider);
      sessionStorage.setItem('auth.ticket', devTicket);
      sessionStorage.setItem(
        'auth.account',
        JSON.stringify({
          provider,
          ...accountPreview,
        })
      );

      navigate('/phone', {
        state: {
          provider,
          authTicket: devTicket,
          account: accountPreview,
          _devToken: token,
        },
      });
    },
    [navigate]
  );

  // Google SDK 초기화
  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res) => {
          const payload = decodeJwt(res.credential);
          afterSocialLogin('google', res.credential, {
            displayName: payload?.name,
            emailMasked: payload?.email,
            avatarUrl: payload?.picture,
          });
        },
        use_fedcm_for_prompt: false,
        ux_mode: 'popup',
        auto_select: false,
      });
    }
  }, [afterSocialLogin, loginWithGoogle]);

  // 네이버 / 구글 OAuth 토큰 처리
  useEffect(() => {
    const hash = location.hash.startsWith('#')
      ? new URLSearchParams(location.hash.slice(1))
      : null;

    if (hash?.get('access_token')) {
      const accessToken = hash.get('access_token');
      const state = hash.get('state') || '';
      const provider = state.startsWith('naver_') ? 'naver' : 'google';

      window.history.replaceState({}, document.title, location.pathname + location.search);

      afterSocialLogin(provider, accessToken, {
        displayName: provider === 'naver' ? '네이버 사용자' : undefined,
        emailMasked: undefined,
        avatarUrl: undefined,
      });
    }
  }, [location, afterSocialLogin]);

  // ⭐ 카카오 REST API 로그인 방식
  const handleKakao = () => {
    if (!KAKAO_REST_API_KEY) {
      alert('카카오 REST API KEY가 설정되지 않았습니다.');
      return;
    }

    const redirect = encodeURIComponent(REDIRECT_URI);
    const authUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${redirect}&response_type=code`;

    window.location.href = authUrl;
  };

  // ⭐ 카카오 code 처리 (백엔드 연동)
  useEffect(() => {
    const code = new URLSearchParams(location.search).get('code');
    if (!code) return;

    loginWithKakao(code).then((result) => {
      if (!result) {
        alert("로그인 실패했습니다.");
        return;
      }

      if (result.level === "access") {
        navigate("/home");
      } else {
        afterSocialLogin("kakao", result.token, {});
      }
    });
  }, [location.search, loginWithKakao, navigate, afterSocialLogin]);

  const handleGoogle = () => {
    if (!window.google?.accounts?.id) {
      alert('구글 SDK 로드 실패');
      return;
    }
    window.google.accounts.id.prompt((n) => {
      if (n.isNotDisplayed() || n.isSkippedMoment()) {
        const url =
          'https://accounts.google.com/o/oauth2/v2/auth' +
          `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
          `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
          `&response_type=token` +
          `&scope=${encodeURIComponent('openid email profile')}` +
          `&prompt=select_account`;
        window.location.href = url;
      }
    });
  };

  const handleNaver = () => {
    if (!NAVER_CLIENT_ID) return alert('네이버 클라이언트 ID가 설정되지 않았습니다.');
    const state = 'naver_' + Math.random().toString(36).slice(2);
    const url =
      `https://nid.naver.com/oauth2.0/authorize?response_type=token` +
      `&client_id=${encodeURIComponent(NAVER_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&state=${encodeURIComponent(state)}`;
    window.location.href = url;
  };

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
