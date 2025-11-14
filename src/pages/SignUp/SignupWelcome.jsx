import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';
import './Auth.css';

export default function SignupWelcome() {
  const { state } = useLocation(); // { phone, provider, token }
  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const valid = useMemo(()=> nickname.trim().length >= 2, [nickname]);

  const finish = async () => {
    // if (!valid) return;

    // const res = await fetch('/api/auth/signup-finish', {
    //   method: 'POST',
    //   headers: { 'Content-Type':'application/json' },
    //   body: JSON.stringify({
    //     phone: state?.phone,
    //     nickname,
    //     provider: state?.provider,
    //     token: state?.token,
    //   }),
    // });
    // const data = await res.json();
    // setSession(data.accessToken, data.user)
    navigate('/home');
  };

  return (
    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />

        <h2 className="lg-title">환영합니다</h2>
        <p className="sp-sub">회원가입을 위해<br/>추가정보를 입력해주세요</p>

        {/* <button className="btn social" type="button" disabled>
          <img src={google} alt="g" /> 구글계정으로 시작
        </button> */}
        <button className="btn social" type="button" disabled>
            {state?.provider === 'google' && <img src={googleLogo} alt="google" />}
            {state?.provider === 'kakao' && <img src={kakaoLogo} alt="kakao" />}
            {state?.provider === 'naver' && <img src={naverLogo} alt="naver" />}
            {state?.account?.emailMasked || `${state?.provider} 계정으로 시작`}
            </button>


        <label className="field-label" htmlFor="nick">닉네임</label>
        <input
          id="nick" className="input"
          placeholder="사용하실 닉네임을 입력하세요"
          value={nickname} onChange={(e)=>setNickname(e.target.value)}
        />

        <button className="btn primary" disabled={!valid} onClick={finish}>
          가입완료
        </button>

        <button className="link-back" onClick={()=>navigate(-1)}>취소</button>
      </div>
    </main>
  );
}

// import React, { useMemo, useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import tripshot_logo from '../../assets/tripshot_logo.png';
// import googleLogo from '../../assets/Group.png';
// import kakaoLogo from '../../assets/symbol-kakao.png';
// import naverLogo from '../../assets/naver_icon.png';
// import './Auth.css';

// const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

// export default function SignupWelcome() {
//   // 서버에서 직전에 리다이렉트해온 단계에서 넘겨준 값들
//   // 기대 형태: { authTicket, account: { provider, displayName?, emailMasked?, avatarUrl? } }
//   const { state } = useLocation();
//   const navigate = useNavigate();

//   const savedTicket  = sessionStorage.getItem('auth.ticket');
//   const savedAccount = sessionStorage.getItem('auth.account');

//   const authTicket = state?.authTicket || savedTicket || '';
//   const account    = state?.account || (savedAccount ? JSON.parse(savedAccount) : null);

//   const provider   = account?.provider; // 'google' | 'kakao' | 'naver'

//   const [nickname, setNickname] = useState(account?.displayName || '');
//   const valid = useMemo(() => nickname.trim().length >= 2, [nickname]);

//   useEffect(() => {
//     if (!authTicket) navigate('/login', { replace: true });
//   }, [authTicket, navigate]);

//   const finish = async () => {
//     if (!valid || !authTicket) return;

//     try {
//       const res = await fetch(`${API_BASE}/login/complete`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         credentials: 'include', // 서버가 httpOnly 쿠키로 세션/토큰을 심는 경우
//         body: JSON.stringify({
//           authTicket,
//           nickname,
//         }),
//       });

//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json(); // 예: { next: 'done' } 또는 { accessToken, user }

//       if (data.next === 'done' || res.ok) {
//         // 사용한 임시 데이터 정리
//         sessionStorage.removeItem('auth.ticket');
//         sessionStorage.removeItem('auth.account');
//         navigate('/', { replace: true });
//       } else {
//         alert('회원가입 처리 단계 인식 실패');
//       }
//     } catch (e) {
//       console.error(e);
//       alert('회원가입 처리 중 오류가 발생했습니다.');
//     }
//   };

//   const ProviderIcon = () => {
//     if (provider === 'google') return <img src={googleLogo} alt="google" />;
//     if (provider === 'kakao')  return <img src={kakaoLogo} alt="kakao" />;
//     if (provider === 'naver')  return <img src={naverLogo} alt="naver" />;
//     return null;
//   };

//   return (
//     <main className="login">
//       <div className="card">
//         <img src={tripshot_logo} className="logo-login" alt="TripShot" />

//         <h2 className="lg-title">환영합니다</h2>
//         <p className="sp-sub">
//           회원가입을 위해<br/>추가정보를 입력해주세요
//         </p>

//         {/* 서버 주도 OAuth: 단순 미리보기용 (프론트에서 토큰/SDK 취급 안 함) */}
//         <button className="btn social" type="button" disabled>
//           <ProviderIcon />
//           {account?.emailMasked || `${provider ?? 'social'} 계정으로 시작`}
//         </button>

//         <label className="field-label" htmlFor="nick">닉네임</label>
//         <input
//           id="nick"
//           className="input"
//           placeholder="사용하실 닉네임을 입력하세요"
//           value={nickname}
//           onChange={(e) => setNickname(e.target.value)}
//         />

//         <button className="btn primary" disabled={!valid || !authTicket} onClick={finish}>
//           가입완료
//         </button>

//         <button className="link-back" onClick={() => navigate(-1)}>취소</button>
//       </div>
//     </main>
//   );
// }

