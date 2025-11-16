
import React, { useState, useMemo ,useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import wrong_input from "../../assets/wrong_input.png";
import back from "../../assets/back.png";
import "./Auth.css";

const API_BASE = (import.meta.env.VITE_API_BASE_URL || "http://localhost:4000").replace(/\/$/, "");

export default function VerifyCode() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [errMsg, setErrMsg] = useState('');

    useEffect(() => {
    if (!state?.token || !state?.phone) {
      console.log('❌ Verify: token/phone 없음 → /login');
      navigate('/login');
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
          "Authorization": `Bearer ${state.token}`,
        },
        body: JSON.stringify({
          phone: state.phone,
          code: Number(code)
        }),
      });

      const data = await res.json();
      if (!data.isSuccess) {
        alert("인증번호가 올바르지 않아요.");
        return;
      }

      if (data.result.level === "access") {
        navigate("/home");
        return;
      }

      if (data.result.level === "signup") {
        navigate("/set-username", {
          state: {
            token: data.result.jwtToken,
            phone: state.phone
          }
        });
      }

    } catch (e) {
      console.error(e);
      alert("서버 오류가 발생했습니다");
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

        {!isCodeValid && code.length > 0 && (
          <p className="error-message">
            <img src={wrong_input} className="error-icon" />
            인증코드를 확인해주세요.
          </p>
        )}

        <button
          className="btn primary phone-btn"
          disabled={!isCodeValid}
          onClick={verify}
        >
          인증하기
        </button>

      </div>
    </main>
  );
}
