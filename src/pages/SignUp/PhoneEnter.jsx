import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import './Auth.css';

const formatKRPhone = (raw) => {
  const d = raw.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0,3)}-${d.slice(3)}`;
  return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
};
 
const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

export default function PhoneEnter() {
  const { state } = useLocation(); // { provider, token } 가능
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhoneValid = useMemo(() => phone.replace(/\D/g, '').length >= 10, [phone]);

  const sendCode = async () => {
    if (!isPhoneValid || loading) return;
    setLoading(true);
    // try {
    //     const res = await fetch(`${API_BASE}/login/send-code`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ phone }),
    //   });
    //   const data = await res.json();
    //   // data: { next: 'verify'|'link', providerCandidates?: [...], masked?: '010-1234-5678' }
    //   if (data.next === 'link') {
    //     navigate('/link', { state: { phone, candidates: data.providerCandidates, provider: state?.provider, token: state?.token } });
    //   } else {
    //     navigate('/verify', { state: { phone, masked: data.masked ?? phone, provider: state?.provider, token: state?.token } });
    //   }
    // } finally {
    //   setLoading(false);
    // }
    navigate('/verify')
  };

  return (
    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />
      
        <h2 className="lg-title">전화번호 인증</h2>
        <p className="sp-sub">소셜 계정 연동을 위해<br/>전화번호 인증이 필요합니다</p>

        <label className="field-label" htmlFor="phone">전화번호</label>
        <input
          id="phone" className="input"
          placeholder="010-1234-5678" inputMode="tel"
          value={phone} onChange={(e)=>setPhone(formatKRPhone(e.target.value))}
          aria-invalid={!isPhoneValid && phone.length>0}
        />

        <button className="btn primary" disabled={!isPhoneValid || loading} onClick={sendCode}>
          인증번호 받기
        </button>

        <button type="button" className="link-back" onClick={()=>navigate(-1)}>이전으로</button>
      </div>
    </main>
  );
}

// import React, { useMemo, useState, useEffect } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import tripshot_logo from '../../assets/tripshot_logo.png';
// import './Auth.css';

// const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

// const formatKRPhone = (raw) => {
//   const d = raw.replace(/\D/g, '').slice(0, 11);
//   if (d.length <= 3) return d;
//   if (d.length <= 7) return `${d.slice(0,3)}-${d.slice(3)}`;
//   return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
// };

// export default function PhoneEnter() {
//   const { state } = useLocation(); // { authTicket } expected
//   const navigate = useNavigate();
//   const [phone, setPhone] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [err, setErr] = useState('');

//   // authTicket 가드
//   useEffect(() => {
//     if (!state?.authTicket) {
//       navigate('/login', { replace: true });
//     }
//   }, [state?.authTicket, navigate]);

//   const isPhoneValid = useMemo(
//     () => phone.replace(/\D/g, '').length >= 10,
//     [phone]
//   );

//   const sendCode = async () => {
//     if (!isPhoneValid || loading) return;
//     if (!state?.authTicket) return navigate('/login', { replace: true });

//     setLoading(true);
//     setErr('');
//     try {
//       const res = await fetch(`${API_BASE}/login/send-code`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         // 쿠키 세션을 쓴다면 주석 해제
//         // credentials: 'include',
//         body: JSON.stringify({
//           phone: phone.replace(/\D/g, ''),
//           authTicket: state.authTicket,
//         }),
//       });

//       if (!res.ok) {
//         const msg = await res.text().catch(() => '');
//         throw new Error(msg || 'send-code failed');
//       }

//       // 서버 계약 예시:
//       // { next: 'verify' | 'link', masked?: '010-****-1234', candidates?: [...] }
//       const data = await res.json();

//       if (data.next === 'link') {
//         navigate('/auth/link', {
//           state: {
//             authTicket: state.authTicket,
//             phone: phone.replace(/\D/g, ''),
//             candidates: data.candidates || [],
//           },
//         });
//       } else {
//         navigate('/auth/verify', {
//           state: {
//             authTicket: state.authTicket,
//             phone: phone.replace(/\D/g, ''),
//             masked: data.masked ?? phone,
//           },
//         });
//       }
//     } catch (e) {
//       console.error(e);
//       setErr('인증번호 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <main className="login">
//       <div className="card">
//         <img src={tripshot_logo} className="logo-login" alt="TripShot" />

//         <h2 className="lg-title">전화번호 인증</h2>
//         <p className="sp-sub">
//           소셜 계정 연동을 위해
//           <br />
//           전화번호 인증이 필요합니다
//         </p>

//         <label className="field-label" htmlFor="phone">전화번호</label>
//         <input
//           id="phone"
//           className="input"
//           placeholder="010-1234-5678"
//           inputMode="tel"
//           value={phone}
//           onChange={(e) => setPhone(formatKRPhone(e.target.value))}
//           aria-invalid={!isPhoneValid && phone.length > 0}
//         />

//         {err && <p className="field-error">{err}</p>}

//         <button
//           className="btn primary"
//           disabled={!isPhoneValid || loading}
//           onClick={sendCode}
//         >
//           {loading ? '전송 중…' : '인증번호 받기'}
//         </button>

//         <button type="button" className="link-back" onClick={() => navigate(-1)}>
//           이전으로
//         </button>
//       </div>
//     </main>
//   );
// }
