// import React, { useEffect, useMemo, useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import back from '../../assets/back.png';
// import wrong_input from '../../assets/wrong_input.png';
// import './Auth.css';

// const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

// export default function PhoneEnter() {
//   const navigate = useNavigate();

//   const [phone, setPhone] = useState('');
//   const [loading, setLoading] = useState(false);
//   const {state} = useLocation();
//   // Login에서 받은 token과 user 정보를 state에서 가져옵니다.
//   const queryToken = state?.token;
//   const userObject = state?.user; // 
    
//   //토큰이 없으면 로그인 페이지로 강제 이동 (인증 보호)
//   useEffect(() => {
//     if (!queryToken) {
//         navigate('/login', { replace: true });
//     }
//   }, [queryToken, navigate]);
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import back from '../../assets/back.png';
import wrong_input from '../../assets/wrong_input.png';
import './Auth.css';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export default function PhoneEnter() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { state } = useLocation(); // 1. navigate state를 우선 읽습니다.

  // 2. URL 쿼리 파라미터도 읽습니다. (useMemo로 한번만 실행)
  //    백엔드가 'token'으로 주는지 'jwt'로 주는지 확인하세요! (로그상 'token'이었습니다)
  const params = useMemo(() => new URLSearchParams(window.location.search), []);
  const urlToken = params.get("token"); 
  const urlUserStr = params.get("user");

  // 3. URL에 토큰이 있으면 그것을 쓰고, 없으면 state에서 찾습니다.
  const queryToken = urlToken || state?.token;
  
  let userObject = state?.user;
  if (!userObject && urlUserStr) {
      try {
          userObject = JSON.parse(decodeURIComponent(urlUserStr));
      } catch(e) { console.error("User data parse error:", e); }
  }

  // 4. 토큰이 없는지 검사 (보호 로직)
  useEffect(() => {
    if (!queryToken) {
        navigate('/login', { replace: true });
        return; // useEffect 즉시 종료
    }

    // 5. (필수!) URL에서 토큰을 성공적으로 읽었다면, 
    //      주소창에서 토큰을 지워 보안을 강화합니다. (새로고침 시 문제 방지)
    if (urlToken) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [queryToken, navigate, urlToken]); // 의존성 배열에 urlToken 추가

  const cleanPhone = phone.replace(/\D/g, '');
  const isPhoneValid = useMemo(() => cleanPhone.length === 11, [cleanPhone]);

  const sendCode = async () => {
    if (!isPhoneValid || loading) return;
    setLoading(true);

    try {
      await fetch(`${API_BASE}/login/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+82${cleanPhone.slice(1)}` })
      });

      navigate("/verify", {
        state: {
          phone: `+82${cleanPhone.slice(1)}`,
          
          token: queryToken, // 수정된 queryToken을 전달
          user: userObject,  // 수정된 userObject를 전달
        }
      });
    } catch (e) {
      console.error("send-code 실패:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-phone">
      <div className="card">

        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src={back} alt="뒤로가기" />
        </button>

        <h2 className="lg-title">전화번호를 인증할게요</h2>
        <p className="sp-sub">전화번호를 하이픈 없이 입력해주세요.</p>

        <input
          className="input phone-input"
          placeholder="01012345678"
          value={phone}
          inputMode="numeric"
          onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
          aria-invalid={!isPhoneValid && phone.length > 0}
        />

        {!isPhoneValid && phone.length > 0 && (
          <p className="error-message">
            <img src={wrong_input} className="error-icon" />
            전화번호를 확인해주세요.
          </p>
        )}

        <button
          className="btn primary phone-btn"
          disabled={!isPhoneValid || loading}
          onClick={sendCode}
        >
          {loading ? "전송중..." : "인증번호 받기"}
        </button>

      </div>
    </main>
  );
}