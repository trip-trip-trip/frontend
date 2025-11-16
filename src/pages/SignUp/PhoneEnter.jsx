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
  const {state} = useLocation();
  // Login에서 받은 token과 user 정보를 state에서 가져옵니다.
  const queryToken = state?.token;
  const userObject = state?.user; // 
    
  //토큰이 없으면 로그인 페이지로 강제 이동 (인증 보호)
  useEffect(() => {
    if (!queryToken) {
        navigate('/login', { replace: true });
    }
  }, [queryToken, navigate]);

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
          
          token: queryToken,
          user: userObject, 
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