import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import wrong_input from "../../assets/wrong_input.png";
import back from "../../assets/back.png";
import "./Auth.css";

//AuthContext 임포트 추가
import { useAuth } from '../../contexts/AuthContext';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export default function VerifyCode() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // Context의 login 함수 사용
  const { login } = useAuth(); 

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [errMsg, setErrMsg] = useState('');

  // 🚨 인증 보호 로직: token과 phone 정보가 없으면 로그인 페이지로 강제 이동
  useEffect(() => {
    if (!state?.token || !state?.phone) {
      console.log('❌ Verify: token/phone 없음 → /login');
      navigate('/login', { replace: true });
    }
  }, [state, navigate]);
  
  const isCodeValid = useMemo(() => code.length === 6, [code]);

  const verify = async () => {
    if (!isCodeValid || loading) return;
    setLoading(true);
    setErrMsg('');

    try {
      const res = await fetch(`${API_BASE}/login/verify-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${state.token}`, // Signup 토큰 사용
        },
        body: JSON.stringify({
          phone: state.phone,
          code: Number(code)
        }),
      });

      const data = await res.json();
      
      if (!data.isSuccess) {
        setErrMsg("인증번호가 올바르지 않아요.");
        return;
      }

      // BE 응답에서 최종 토큰과 유저 정보 추출
      const { level, jwtToken, user } = data.result; 

      if (level === "access") {
        // 기존 유저: 토큰과 유저 정보 저장 후 홈으로 (프로필 업데이트)
        login(jwtToken, user);
        navigate("/home", { replace: true });
        return;
      }

      if (level === "signup") {
        // 신규 유저: set-username 페이지로 이동
        navigate("/set-username", { 
          state: {
            token: jwtToken,
            phone: state.phone,
            user: state.user || user, // 소셜에서 받은 정보 전달 (회원가입 완료 시 사용)
          }
        });
      }

    } catch (e) {
      console.error(e);
      setErrMsg("서버 오류가 발생했습니다");
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

        <h2 className="lg-title">인증번호를 입력해주세요</h2>
        <p className="sp-sub">입력하신 번호로 인증코드를 전송했어요.</p>

        <div className="input phone-display-box">{state.phone}</div>

        <input
          className="input phone-input"
          placeholder="000000"
          inputMode="numeric"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
        />

        {(errMsg || (!isCodeValid && code.length > 0)) && (
          <p className="error-message">
            <img src={wrong_input} className="error-icon" alt="오류" />
            {errMsg || "인증코드를 확인해주세요."}
          </p>
        )}

        <button
          className="btn primary phone-btn"
          disabled={!isCodeValid || loading}
          onClick={verify}
        >
          인증하기
        </button>
      </div>
    </main>
  );
}
