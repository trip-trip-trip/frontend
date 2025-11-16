import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import tripshot_logo from '../../assets/tripshot_logo.png';
import kakao from '../../assets/symbol-kakao.png';
import google from '../../assets/Group.png';
import './Auth.css';

export default function AccountFound() {
  const { state } = useLocation(); // { phone, candidates, provider, token } 예정
  const navigate = useNavigate();

  const link = async () => {
    ////////////
    navigate('/'); 
  };

  return (
    <main className="login">
      <div className="card">
        <img src={tripshot_logo} className="logo-login" alt="TripShot" />

        <h1 className="lg-title">기존 계정 발견</h1>
        <p className="sp-sub">
          해당 전화번호로 가입된
          <br />
          계정이 있습니다
        </p>

        <div className="account-box">
          <div className="provider-row">
            <img src={kakao} alt="kakao" className="provider-icon" />
            <span className="provider-label">카카오톡으로 가입</span>
          </div>

          <div className="current-login">
            <span>현재 로그인:</span>
            <img src={google} alt="google" className="current-provider-icon" />
            <span>구글</span>
          </div>
        </div>

        <button className="btn primary" onClick={link}>
          기존 계정과 연동하기
        </button>

        <button className="link-back" onClick={() => navigate(-1)}>
          취소
        </button>
      </div>
    </main>
  );
}
