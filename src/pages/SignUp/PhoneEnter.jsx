import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import back from '../../assets/back.png';
import wrong_input from '../../assets/wrong_input.png'; 
import './Auth.css';

const formatPhone = (raw) => {
  return raw.replace(/\D/g, '').slice(0, 11);
};

const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');

export default function PhoneEnter() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const isPhoneValid = useMemo(
    () => phone.replace(/\D/g, '').length >= 11,
    [phone]
  );

  // const sendCode = async () => {
  //   if (!isPhoneValid || loading) return;
  //   setLoading(true);
  //   try {
  //     const res = await fetch(`${API_BASE}/login/send-code`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({
  //         phone: phone.replace(/\D/g, ''),        
  //         provider: state?.provider,
  //       }),
  //     });

  //     if (!res.ok) throw new Error(`HTTP ${res.status}`);
  //     const data = await res.json();

  //     navigate('/verify', {
  //       state: {
  //         phone,
  //         provider: state?.provider,
  //         token: state?.token,
  //       },
  //     });
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  const sendCode = async () => {
    navigate('/verify', {
        state: {
            phone: phone,
            provider: state?.provider, 
            token: state?.token,
        },
    });
  };

  return (
    <main className="login-phone">
      <div className="card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src={back} alt="뒤로가기" />
        </button>
        <h2 className="lg-title">전화번호를 인증할게요</h2>
        <p className="sp-sub">
        전화번호를 하이픈(-) 없이 입력해주세요.
        </p>

        <input
          id="phone"
          className="input phone-input"
          placeholder="01012345678"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          // 전화번호가 유효하지 않을 때만 aria-invalid 설정
          aria-invalid={!isPhoneValid && phone.length > 0} 
        />
        
        {!isPhoneValid && phone.length > 0 && (
          <p className="error-message">
            <img src={wrong_input} alt='오류 아이콘' className="error-icon"/>
            전화번호를 확인해주세요.
          </p>
        )}
       

        <button
          className="btn primary phone-btn"
          disabled={!isPhoneValid || loading}
          onClick={sendCode}
        >
          {isPhoneValid ? '인증번호 받기':'전화번호를 입력해주세요'}
        </button>
      </div>
    </main>
  );
}

