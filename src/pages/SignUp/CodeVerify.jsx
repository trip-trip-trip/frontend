import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import './Auth.css';

const useCountdown = (sec) => {
  const [left, setLeft] = useState(sec);
  useEffect(() => {
    if (left <= 0) return;
    const t = setInterval(()=>setLeft(v=>v-1), 1000);
    return () => clearInterval(t);
  }, [left]);
  return [left, setLeft];
};

export default function CodeVerify() {
  const { state } = useLocation(); // { phone, masked, provider, token }
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useCountdown(180); // 3:00

  const isCodeValid = useMemo(()=> code.trim().length >= 4, [code]);
  const masked = state?.masked || state?.phone||'010-****-****';

  const verify = async () => {
    // if (!isCodeValid || loading) return;
    // setLoading(true);
    // try {
      
    //   const res = await fetch('/login/verify-code', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ phone: state?.phone, code, provider: state?.provider, token: state?.token }),
    //   });
    //   const data = await res.json();
    //   // { next: 'done'|'link'|'signup', candidates?, accessToken?, user? }
    //   if (data.next === 'done') {
    //     // 세션 저장 후 홈으로
    //     // setSession(data.accessToken, data.user)
    //     navigate('/');
    //   } else if (data.next === 'link') {
    //     navigate('/link', { state: { phone: state?.phone, candidates: data.candidates, provider: state?.provider, token: state?.token } });
    //   } else {
    //     navigate('/signup', { state: { phone: state?.phone, provider: state?.provider, token: state?.token } });
    //   }
    // } finally {
    //   setLoading(false);
    // }
    navigate('/signup')
  };

  const resend = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch('/api/login/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: state?.phone }),
      });
      setLeft(180); //3분 재재생
    } finally { setLoading(false); }
  };

  const mm = String(Math.floor(left/60)).padStart(1,'0');
  const ss = String(left%60).padStart(2,'0');

  return (

    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />
        <h2 className="lg-title">인증번호 입력</h2>
        {/* <p className="sp-sub">{masked}로<br/>인증번호를 발송했습니다</p> */}
        <p className="sp-sub">{masked}로<br/>인증번호를 발송했습니다</p>
       
        <div className="timer">{mm}:{ss}</div>

        <label className="field-label" htmlFor="code">인증번호</label>
        <input
          id="code" className="input" inputMode="numeric"
          placeholder="6자리 인증번호 입력"
          value={code} onChange={(e)=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))}
        />

        <button className="btn primary" disabled={!isCodeValid || loading || left<=0} onClick={verify}>
          인증하기
        </button>

        <button className="btn ghost small" disabled={loading} onClick={resend}>
          인증번호 재전송
        </button>

        <button className="link-back" onClick={()=>navigate(-1)}>이전으로</button>
      </div>
    </main>
  );
}
