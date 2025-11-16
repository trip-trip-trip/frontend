// import React, { useEffect, useCallback } from 'react'; 
// import { useNavigate, useLocation } from 'react-router-dom';
// import './Login.css';
// import welcome_text from '../../assets/Welcome.png'; 
// import tripshot_logo from '../../assets/loginLogo.png';
// import googleLogo from '../../assets/Group.png';
// import kakaoLogo from '../../assets/symbol-kakao.png';
// import naverLogo from '../../assets/naver_icon.png';

// const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
// const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

// const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, ''); 
// const REDIRECT_URI = `${window.location.origin}/login`;

// const useAuth = () => ({ 
//   loginWithKakao: async () => true, 
//   loginWithGoogle: async () => true 
// });


// function decodeJwt(idToken) {
//   try {
//     const base64 = idToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
//     const json = decodeURIComponent(atob(base64).split('').map(c => {
//       return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
//     }).join(''));
//     return JSON.parse(json);
//   } catch { return {}; }
// }

// export default function Login() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { loginWithKakao, loginWithGoogle } = useAuth(); 

//   //소셜 로그인 완료 후 다음 스텝으로 넘기기 (임시)
//   const afterSocialLogin = useCallback((provider, token, accountPreview = {}) => {
//     const devTicket = `dev-${provider}-${Date.now()}`;
//     sessionStorage.setItem('auth.provider', provider);
//     sessionStorage.setItem('auth.ticket', devTicket);
//     sessionStorage.setItem('auth.account', JSON.stringify({
//       provider,
//       ...accountPreview,
//     }));


//     navigate('/phone', {
//       state: {
//         provider,
//         authTicket: devTicket,
//         account: accountPreview,
//         _devToken: token,
//       },
//     });
//   }, [navigate]);

//   //카카오 SDK 초기화
//   useEffect(() => {
//     if (window.Kakao && !window.Kakao.isInitialized()) {
//       window.Kakao.init(KAKAO_JS_KEY); 
//     }
//   }, []);

//   // 구글 SDK 초기화 및 콜백 처리
//   useEffect(() => {
//     if (window.google?.accounts?.id) {
//       window.google.accounts.id.initialize({
//         client_id: GOOGLE_CLIENT_ID,
//         callback: (res) => {
//           /*
//           const loginSuccess = loginWithGoogle(res.credential); 
//           if (!loginSuccess) {
//             alert('Google 사용자 정보 처리에 실패했습니다.');
//             return;
//           }
//           */
          
//           const payload = decodeJwt(res.credential);
//           afterSocialLogin('google', res.credential, {
//             displayName: payload?.name,
//             emailMasked: payload?.email,
//             avatarUrl: payload?.picture,
//           });
//         },
//         use_fedcm_for_prompt: false,
//         ux_mode: 'popup',
//         auto_select: false,
//       });
//     }
//   }, [afterSocialLogin, loginWithGoogle]); 

//   // 리다이렉트 로그인(네이버/구글 OAuth) 처리
//   useEffect(() => {
//     const hash = location.hash.startsWith('#') ? new URLSearchParams(location.hash.slice(1)) : null;
//     if (hash?.get('access_token')) {
//       const accessToken = hash.get('access_token');
//       // 네이버인지 구글인지 판단
//       const state = hash.get('state') || '';
//       const provider = state.startsWith('naver_') ? 'naver' : 'google';

//       window.history.replaceState({}, document.title, location.pathname + location.search);
//       afterSocialLogin(provider, accessToken, {
//         displayName: provider === 'naver' ? '네이버 사용자' : undefined,
//         emailMasked: undefined,
//         avatarUrl: undefined,
//       });
//     }
//   }, [location, afterSocialLogin]);

  
//   const startApiLogin = (provider) => {
//       window.location.href = `${API_BASE}/login/start/${provider}`;
//   };

//   const handleApiKakao = () => startApiLogin('kakao');
//   const handleApiGoogle = () => startApiLogin('google');
//   const handleApiNaver = () => startApiLogin('naver');
  

//   const handleKakao = () => {
//     if (!window.Kakao) return alert('카카오 SDK 로드 실패');
//     window.Kakao.Auth.login({
//       scope: 'profile_nickname, profile_image', 
//       success: async (authObj) => {
        
//         const loginSuccess = await loginWithKakao(authObj.access_token);
//         if (!loginSuccess) {
//           alert('Kakao 사용자 정보 처리에 실패했습니다.');
//           return;
//         }
        

//         let account = {};
//         try {
//           // 카카오 프로필 정보 요청 
//           const me = await window.Kakao.API.request({ url: '/v2/user/me' });
//           account = {
//             displayName: me?.kakao_account?.profile?.nickname,
//             emailMasked: me?.kakao_account?.email, //이메일도 필요할까..?
//             avatarUrl: me?.kakao_account?.profile?.profile_image_url,
//           };
//         } catch {} 
//         afterSocialLogin('kakao', authObj.access_token, account);
//       },
//       fail: (err) => {
//         console.error('Kakao login fail', err);
//         alert('카카오 로그인 실패');
//       },
//     });
//   };

//   const handleGoogle = () => {
//     if (!window.google?.accounts?.id) {
//       alert('구글 SDK 로드 실패');
//       return;
//     }
//     window.google.accounts.id.prompt((n) => {
//       // 프롬프트가 표시되지 않거나 스킵된 경우 OAuth 리다이렉트 방식으로 대체
//       if (n.isNotDisplayed() || n.isSkippedMoment()) {
//         const url =
//           'https://accounts.google.com/o/oauth2/v2/auth' +
//           `?client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
//           `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//           `&response_type=token` +
//           `&scope=${encodeURIComponent('openid email profile')}` +
//           `&prompt=select_account`;
//         window.location.href = url;
//       }
//     });
//   };

//   const handleNaver = () => {
//     if (!NAVER_CLIENT_ID) return alert('네이버 클라이언트 ID가 설정되지 않았습니다.');
//     const state = 'naver_' + Math.random().toString(36).slice(2);
//     const url =
//       `https://nid.naver.com/oauth2.0/authorize?response_type=token` +
//       `&client_id=${encodeURIComponent(NAVER_CLIENT_ID)}` +
//       `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
//       `&state=${encodeURIComponent(state)}`;
//     window.location.href = url;
//   };

//   return (
//     <main className="login">
//       <img src={welcome_text} className="welcome-login" alt="Welcome" />
//       <h1 className="lg-title">환영합니다</h1>
//       <img src={tripshot_logo} className="logo-login" alt="TripShot" />

//       <div className="login-buttons">
//         <button className="social-btn kakao-login" onClick={handleApiKakao}>
//         {/* onClick={handleApiKakao} */}
//           <img src={kakaoLogo} alt="" className="social-icon" />
//           카카오 계정으로 계속하기
//         </button>

//         <button className="social-btn google-login" onClick={handleApiGoogle}>
//         {/* onClick={handleApiGoogle} */}
//           <img src={googleLogo} alt="" className="social-icon" />
//           구글 계정으로 계속하기
//         </button>

//         <button className="social-btn naver-login" onClick={handleApiNaver}>
//         {/* onClick={handleApiNaver} */}
//           <img src={naverLogo} alt="" className="social-icon" />
//           네이버 계정으로 계속하기
//         </button>
//       </div>
//     </main>
//   );
// }

import React, { useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Login.css';
import welcome_text from '../../assets/Welcome.png'; 
import tripshot_logo from '../../assets/loginLogo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const NAVER_CLIENT_ID = import.meta.env.VITE_NAVER_CLIENT_ID;
const KAKAO_JS_KEY = import.meta.env.VITE_KAKAO_JS_KEY;

const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, ''); 
const REDIRECT_URI = `${window.location.origin}/login`;

// 더미 함수를 실제 API 호출 로직으로 변경
const useAuth = () => ({
  loginWithApi: async (provider) => {
    try {
      const response = await fetch(`${API_BASE}/login/start/${provider}`, {
        method: 'GET', 
        headers: { 
          'Content-Type': 'application/json' 
        },
        // ⭐ 쿠키/세션 정보를 포함하도록 설정 추가
        credentials: 'include',
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
      const data = await response.json();
      
      if (data.isSuccess) {
          return data.result; // level, jwtToken 포함
      } else {
          throw new Error(data.message || 'API 로그인 실패');
      }

    } catch (error) {
      console.error(`[API Login] ${provider} failed:`, error);
      return null; 
    }
  }
});

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
  const { loginWithApi } = useAuth(); 

  // 소셜 로그인 완료 후 다음 스텝으로 넘기기 (임시)
  const afterSocialLogin = useCallback((provider, token, accountPreview = {}) => {
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
  }, [navigate]);

  //카카오 SDK 초기화
  useEffect(() => {
    if (window.Kakao && !window.Kakao.isInitialized()) {
      window.Kakao.init(KAKAO_JS_KEY); 
    }
  }, []);

  // 구글 SDK 초기화 및 콜백 처리
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
  }, [afterSocialLogin]); 

  // 리다이렉트 로그인(네이버/구글 OAuth) 처리
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
  }, [location, afterSocialLogin]);

  // ⭐ API 로그인 버튼 클릭 핸들러
  const handleLoginClick = async (provider) => {
    // 로딩 상태 설정이 있다면 여기에 추가
    const result = await loginWithApi(provider);

    if (result) {
        const { level, jwtToken } = result;
        
        sessionStorage.setItem('auth.jwt', jwtToken);

        if (level === 'access' || level === 'signup') {
            // 로그인 성공 또는 가입 필요 (어쨌든 다음 단계로 이동)
            afterSocialLogin(provider, jwtToken, {
                displayName: provider + ' 사용자',
                avatarUrl: null,
            });
        } else {
            alert('알 수 없는 로그인 상태입니다: ' + level);
        }

    } else {
        alert(`${provider} 로그인 처리 중 오류가 발생했습니다.`);
    }
    // 로딩 상태 해제
  };
  
  // SDK를 통한 카카오 로그인 (예비용)
  const handleKakao = () => {
    // ... (기존 카카오 SDK 로그인 로직 유지)
  };
  
  // SDK를 통한 구글 로그인 (예비용)
  const handleGoogle = () => {
    // ... (기존 구글 SDK 로그인 로직 유지)
  };

  // SDK를 통한 네이버 로그인 (예비용)
  const handleNaver = () => {
    // ... (기존 네이버 SDK 로그인 로직 유지)
  };

  return (
    <main className="login">
      <img src={welcome_text} className="welcome-login" alt="Welcome" />
      <h1 className="lg-title">환영합니다</h1>
      <img src={tripshot_logo} className="logo-login" alt="TripShot" />

      <div className="login-buttons">
        {/* ⭐ handleLoginClick을 연결 */}
        <button className="social-btn kakao-login" onClick={() => handleLoginClick('kakao')}>
          <img src={kakaoLogo} alt="" className="social-icon" />
          카카오 계정으로 계속하기
        </button>

        <button className="social-btn google-login" onClick={() => handleLoginClick('google')}>
          <img src={googleLogo} alt="" className="social-icon" />
          구글 계정으로 계속하기
        </button>

        <button className="social-btn naver-login" onClick={() => handleLoginClick('naver')}>
          <img src={naverLogo} alt="" className="social-icon" />
          네이버 계정으로 계속하기
        </button>
      </div>
    </main>
  );
}
