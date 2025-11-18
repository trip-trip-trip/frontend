// import React, { useMemo, useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import tripshot_logo from '../../assets/tripshot_logo.png';
// import googleLogo from '../../assets/Group.png';
// import kakaoLogo from '../../assets/symbol-kakao.png';
// import naverLogo from '../../assets/naver_icon.png';
// import './Auth.css';

// export default function SignupWelcome() {
//   const { state } = useLocation(); // { phone, provider, token }
//   const navigate = useNavigate();
//   const [nickname, setNickname] = useState('');
//   const valid = useMemo(()=> nickname.trim().length >= 2, [nickname]);

//   const finish = async () => {
//     // if (!valid) return;

//     // const res = await fetch('/api/auth/signup-finish', {
//     //   method: 'POST',
//     //   headers: { 'Content-Type':'application/json' },
//     //   body: JSON.stringify({
//     //     phone: state?.phone,
//     //     nickname,
//     //     provider: state?.provider,
//     //     token: state?.token,
//     //   }),
//     // });
//     // const data = await res.json();
//     // setSession(data., data.user)
//     navigate('/');
//   };


//   return (
//     <main className="login">
//       <div className="card">
//         <img src={tripshot_logo} className="logo-login" alt="TripShot" />

//         <h2 className="lg-title">환영합니다</h2>
//         <p className="sp-sub">회원가입을 위해<br/>추가정보를 입력해주세요</p>

//         {/* <button className="btn social" type="button" disabled>
//           <img src={google} alt="g" /> 구글계정으로 시작
//         </button> */}
//         <button className="btn social" type="button" disabled>
//             {state?.provider === 'google' && <img src={googleLogo} alt="google" />}
//             {state?.provider === 'kakao' && <img src={kakaoLogo} alt="kakao" />}
//             {state?.provider === 'naver' && <img src={naverLogo} alt="naver" />}
//             {state?.account?.emailMasked || `${state?.provider} 계정으로 시작`}
//             </button>


//         <label className="field-label" htmlFor="nick">닉네임</label>
//         <input
//           id="nick" className="input"
//           placeholder="사용하실 닉네임을 입력하세요"
//           value={nickname} onChange={(e)=>setNickname(e.target.value)}
//         />

//         <button className="btn primary" disabled={!valid} onClick={finish}>
//           가입완료
//         </button>

//         <button className="link-back" onClick={()=>navigate(-1)}>취소</button>
//       </div>
//     </main>
//   );
// }

import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import googleLogo from '../../assets/Group.png';
import kakaoLogo from '../../assets/symbol-kakao.png';
import naverLogo from '../../assets/naver_icon.png';
import './Auth.css';


export default function SignupWelcome() {
  // verify-code 단계에서 넘겨준 값: { phone, provider, token, account }
  const { state } = useLocation();
  const navigate = useNavigate();

  const provider = state?.provider;
  const account  = state?.account;

  const ProviderIcon = () => {
    if (provider === 'google') return <img src={googleLogo} alt="google" />;
    if (provider === 'kakao')  return <img src={kakaoLogo} alt="kakao" />;
    if (provider === 'naver')  return <img src={naverLogo} alt="naver" />;
    return null;
  };

  const providerLabel =
    provider === 'google' ? '구글'
    : provider === 'kakao' ? '카카오톡'
    : provider === 'naver' ? '네이버'
    : '소셜';

  const finish = async () => {
    
    // const res = await fetch(`${API_BASE}/login/complete`, {...})
    navigate('/', { replace: true });
  };

  return (
    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />

        <h2 className="lg-title">환영합니다</h2>
        <p className="sp-sub">
          TripShot 회원가입이 완료되었습니다.<br />
          지금부터 여행 기록을 시작해보세요.
        </p>

        <button className="btn social" type="button" disabled>
          <ProviderIcon />
          {account?.emailMasked
            ? `${account.emailMasked} (${providerLabel} 계정)`
            : `${providerLabel} 계정으로 가입 완료`}
        </button>

        <button className="btn primary" onClick={finish}>
          TripShot 시작하기
        </button>

        <button className="link-back" onClick={() => navigate('/login')}>
          다른 계정으로 로그인
        </button>
      </div>
    </main>
  );
}
