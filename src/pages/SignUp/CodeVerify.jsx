import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import back from '../../assets/back.png';
import wrong_input from '../../assets/wrong_input.png'; // 오류 아이콘
import './Auth.css';

const API_BASE = (import.meta?.env?.VITE_API_BASE || 'http://localhost:4000').replace(/\/$/, '');


export default function CodeVerify() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const isCodeValid = useMemo(() => code.trim().length >= 6, [code]);

  const verify = async () => {
    if (!isCodeValid || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/login/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: state?.phone?.replace(/\D/g, ''),
          code,
          provider: state?.provider,
          token: state?.token,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      navigate('/');
    } catch (e) {
      console.error(e);
      // alert('인증에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // const verify = async () => {
  //   try{
  //     navigate('/');
  // }catch (e) {
  //     console.error(e);
  //     alert('인증에 실패했습니다.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const resend = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await fetch(`${API_BASE}/login/send-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: state?.phone?.replace(/\D/g, '') }),
      });
    } catch (e) {
      console.error(e);
      // alert('재전송에 실패했습니다.');
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
        <h2 className="lg-title">인증번호 입력해주세요</h2>
        <p className="sp-sub">
          입력하신 번호로 인증코드 문자메시지를 전송했어요.
        </p>
        <div className="input phone-display-box">
          {state?.phone || '전화번호 정보 없음'}
          </div>

        <input
          id="code"
          className="input"
          inputMode="numeric"
          placeholder="6자리 인증번호 입력"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />
        {!isCodeValid && (
          <p className="error-message">
            <img src={wrong_input} alt='오류 아이콘' className="error-icon"/>
                인증코드를 확인해주세요.
          </p>
        )}

        <button
          className="btn primary"
          disabled={!isCodeValid || loading }
          onClick={verify}
        >
      {isCodeValid ? '인증하기':'인증코드를 입력해주세요'}            
      </button>

        <button className="send-again-login" disabled={loading} onClick={resend}>
          인증번호 다시받기
        </button>
        
      </div>
    </main>
  );
}
