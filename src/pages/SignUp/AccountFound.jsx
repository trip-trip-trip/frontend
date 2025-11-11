import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import kakao from '../../assets/symbol-kakao.png'; // 선택
import google from '../../assets/Group.png';
import './Auth.css';

export default function AccountFound() {
  const { state } = useLocation(); // { phone, candidates, provider, token }
  const navigate = useNavigate();

  const link = async () => {
    const res = await fetch('/api/auth/link-social', {
      method: 'POST',
      headers: { 'Content-Type':'application/json' },
      body: JSON.stringify({
        phone: state?.phone,
        provider: state?.provider,
        token: state?.token,
      }),
    });
    const data = await res.json();
    // setSession(data.accessToken, data.user)
    navigate('/');
  };

  return (
    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />
        <h2 className="lg-title">기존 계정 발견</h2>
        <p className="sp-sub">해당 전화번호로 가입된<br/>계정이 있습니다</p>

        <div className="account-box">
          <div className="provider-row">
            <img src={kakao} alt="kakao" />
            <span>카카오톡으로 가입</span>
          </div>
          <div className="current-login">
            현재 로그인: <img src={google} alt="g" /> 구글
          </div>
        </div>

        <button className="btn primary" onClick={link}>
          기존 계정과 연동하기
        </button>

        <button className="link-back" onClick={()=>navigate(-1)}>취소</button>
      </div>
    </main>
  );
}
