import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import tripshot_logo from '../../assets/tripshot_logo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';
import { useAuth } from '../../contexts/AuthContext';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const NAVER_CLIENT_ID  = import.meta.env.VITE_NAVER_CLIENT_ID;
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

const REDIRECT_URI = `${window.location.origin}/login`;

function decodeJwt(idToken) {
  try {
    const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(atob(base64).split('').map(c => {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(json);
  } catch { return {}; }
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
const { loginWithKakao, loginWithGoogle } = useAuth();

  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY); // JS Key(프론트 임시)
    }
  }, []);

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (res) => {
          const loginSuccess = loginWithGoogle(res.credential); // 님의 Context에 저장
          if (!loginSuccess) {
            alert('Google 사용자 정보 처리에 실패했습니다.');
            return;
          }
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
  }, [loginWithGoogle]);

  useEffect(() => {
    const hash = location.hash.startsWith('#') ? new URLSearchParams(location.hash.slice(1)) : null;
    if (hash?.get('access_token')) {
      const accessToken = hash.get('access_token');
      // 네이버인지 구글인지 판단
      const state = hash.get('state') || '';
      const provider = state.startsWith('naver_') ? 'naver' : 'google';

      window.history.replaceState({}, document.title, location.pathname + location.search);
      afterSocialLogin(provider, accessToken, {
        displayName: provider === 'naver' ? '네이버 사용자' : undefined,
        emailMasked: undefined,
        avatarUrl: undefined,
      });
    }
  }, [location]);

  // 4) 소셜 로그인 완료 후 다음 스텝으로 넘기기 (임시)
  const afterSocialLogin = (provider, token, accountPreview = {}) => {
    const devTicket = `dev-${provider}-${Date.now()}`;
    sessionStorage.setItem('auth.provider', provider);
    sessionStorage.setItem('auth.ticket', devTicket);
    sessionStorage.setItem('auth.account', JSON.stringify({
      provider,
      ...accountPreview,
    }));


    navigate('/phone', {
      state: {
        provider,
        authTicket: devTicket,
        account: accountPreview,
        _devToken: token,
      },
    });
  };

  const handleKakao = () => {
    if (!window.Kakao) return alert('카카오 SDK 로드 실패');
    window.Kakao.Auth.login({
      scope: 'profile_nickname, profile_image',
      success: async (authObj) => {
        const loginSuccess = await loginWithKakao(authObj.access_token);
        if (!loginSuccess) {
          alert('Kakao 사용자 정보 처리에 실패했습니다.');
          return;
        }

        let account = {};
        try {
          const me = await window.Kakao.API.request({ url: '/v2/user/me' });
          account = {
            displayName: me?.kakao_account?.profile?.nickname,
            emailMasked: me?.kakao_account?.email,
            avatarUrl: me?.kakao_account?.profile?.profile_image_url,
          };
        } catch {} // 프로필 실패해도 진행
        afterSocialLogin('kakao', authObj.access_token, account);
      },
      fail: (err) => {
        console.error('Kakao login fail', err);
        alert('카카오 로그인 실패');
      },
    });
  };

  const handleGoogle = () => {
    if (!window.google?.accounts?.id) {
      alert('구글 SDK 로드 실패');
      return;
    }
    // 원탭/팝업 시도
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
      <img src={tripshot_logo} className="logo-login" alt="TripShot" />
      <h1 className="lg-title">환영합니다</h1>

      <button className="naver-login social-btn" onClick={handleNaver}>
        <img src={naverLogo} alt="" className="social-icon" />
        네이버 계정으로 계속하기
      </button>

      <button className="kakao-login social-btn" onClick={handleKakao}>
        <img src={kakaoLogo} alt="" className="social-icon" />
        카카오 계정으로 계속하기
      </button>

      <button className="google-login social-btn" onClick={handleGoogle}>
        <img src={googleLogo} alt="" className="social-icon" />
        구글 계정으로 계속하기
      </button>
    </main>
  );
}


// import React, { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import './Login.css';
// import tripshot_logo from '../../assets/tripshot_logo.png';
// import googleLogo from '../../assets/Group.png';
// import kakaoLogo from '../../assets/symbol-kakao.png';
// import naverLogo from '../../assets/naver_icon.png';

// const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

// export default function Login() {
//   const navigate = useNavigate();
//   const location = useLocation();

//   // 서버 콜백 후 ?next=&authTicket= (또는 #next=...) 분기
//   useEffect(() => {
//     const search = new URLSearchParams(location.search);
//     const hash = location.hash.startsWith('#')
//       ? new URLSearchParams(location.hash.slice(1))
//       : new URLSearchParams();

//     const next = search.get('next') || hash.get('next');
//     const authTicket = search.get('authTicket') || hash.get('authTicket');

//     if (!next) return;

//     // 새로고침 시 중복 처리 방지
//     window.history.replaceState({}, document.title, location.pathname);

//     if (next === 'done') {
//       navigate('/');
//       return;
//     }

//     if (next === 'phone') {
//       if (!authTicket) return navigate('/login'); // 가드
//       // 팀 합의대로 경로 사용: '/auth/phone' 또는 '/phone'
//       navigate('/auth/phone', { state: { authTicket } });
//       return;
//     }

//     if (next === 'link') {
//       if (!authTicket) return navigate('/login');
//       // '/auth/link' 또는 '/link'
//       navigate('/auth/link', { state: { authTicket } });
//       return;
//     }
//   }, [location, navigate]);

//   // 서버 주도 시작: 버튼 -> /login/start/{provider}
//   const startLogin = (provider) => {
//     window.location.href = `${API_BASE}/login/start/${provider}`;
//   };

//   return (
//     <main className="login">
//       <img src={tripshot_logo} className="logo-login" alt="TripShot" />
//       <h1 className="lg-title">환영합니다</h1>

//       <button className="naver-login social-btn" onClick={() => startLogin('naver')}>
//         <img src={naverLogo} alt="" className="social-icon" />
//         네이버 계정으로 계속하기
//       </button>

//       <button className="kakao-login social-btn" onClick={() => startLogin('kakao')}>
//         <img src={kakaoLogo} alt="" className="social-icon" />
//         카카오 계정으로 계속하기
//       </button>

//       <button className="google-login social-btn" onClick={() => startLogin('google')}>
//         <img src={googleLogo} alt="" className="social-icon" />
//         구글 계정으로 계속하기
//       </button>
//     </main>
//   );
// }

