import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import back from '../../assets/back.png';
import wrong_input from '../../assets/wrong_input.png'; // 1. [추가] 에러 아이콘 임포트
import { useAuth } from '../../contexts/AuthContext';
import './Auth.css'; 


const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000').replace(/\/$/, '');
export default function SetUsername() {
  const { state } = useLocation(); // CodeVerify에서 넘겨준 state (phone, 'signup' token)
  const navigate = useNavigate();
  const { login } = useAuth(); // "진짜" 로그인 함수
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [beErrorMsg, setBeErrorMsg] = useState(''); // 중복 ID 에러 메시지

const token = state?.token;   // CodeVerify 에서 넘긴 signup 토큰
const phone = state?.phone;   // CodeVerify 에서 넘긴 전화번호

const tag=username;
  // 3. [수정] 피그마의 유효성 검사 (2~10자)
// 1. [수정] 피그마의 "영문, 숫자, 언더스코어" 규칙 + 2~10자 FE 유효성 검사
  const feErrorMsg = useMemo(() => {
    if (username.length === 0) return ''; // 비어있으면 통과
    
    // 1-1. 영문, 숫자, 언더스코어(_)만 허용
    if (!/^[a-zA-Z0-9_]*$/.test(username)) {
      return "영문, 숫자, 언더스코어(_)만 사용할 수 있어요.";
    }
    // 1-2. 2자 미만
    if (username.length < 2) {
      return "ID는 2자 이상 입력해주세요.";
    }
    // 1-3. 10자 초과
    if (username.length > 10) {
      return "ID는 10자 이하로 입력해주세요.";
    }
    return ''; // 모든 유효성 검사 통과
  }, [username]);

  // '다음' 버튼 활성화 조건 (FE 유효성 검사 통과)
  const isValid = !feErrorMsg && username.length >= 2;

  const handleCompleteSignup = async () => {
    if (!isValid || loading) return;
    setLoading(true);
    setBeErrorMsg(''); // BE 에러 초기화

    try {
      const res = await fetch(`${API_BASE}/login/signup`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // CodeVerify에서 받은 'signup' 토큰
        },
        body: JSON.stringify({
       tag:tag
            }),
      });

      const data = await res.json();
      
      if (!data.isSuccess) {
        // 5. [수정] BE가 실패 응답(중복 ID 등)을 줬을 때
        // (피그마 디자인의 "이미 사용 중인 ID에요!" 멘트)
        if (data.code === 400) { // (BE가 중복 시 400을 준다고 가정)
          setBeErrorMsg("이미 사용 중인 ID에요!");
        } else {
          setBeErrorMsg(data.message); // 그 외 서버 에러 메시지
        }
        throw new Error(data.message);
      }

      const { level, jwtToken, user } = data.result;

      if (level === 'access') {
        // [회원가입/로그인 성공]
        login(jwtToken, user); // AuthContext에 "진짜" 토큰과 유저 정보 저장
        navigate('/home', { replace: true });// 홈으로 이동
      } else {
        throw new Error("회원가입에 실패했습니다. (Access Level이 아님)");
      }

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    // 6. [수정] PhoneEnter와 동일한 래퍼 사용
    <main className="login-phone">
      <div className="card">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <img src={back} alt="뒤로가기" />
        </button>
        
        {/* 👇 4. [추가] 피그마 멘트 (새로 오셨군요!) */}
        <p className="welcome-text">새로 오셨군요! 환영해요:D</p>
        
        {/* 👇 5. [수정] 피그마 멘트 (ID를 만들어요) */}
        <h2 className="lg-title">ID를 만들어요</h2>
        <p className="sp-sub">
          {/* 👇 6. [수정] 피그마 멘트 (트립샷에서...) */}
          트립샷에서 사용하실 ID를 입력해주세요.<br />
          ID는 고유한 이름으로 영문, 숫자, 언더스코어(_)만 사용할 수 있어요.
        </p>

        <input
          id="username"
          className="input phone-input"
          placeholder="멋진 이름을 지어봐요" // 7. [수정] 피그마 멘트
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (beErrorMsg) setBeErrorMsg(''); // BE 에러 리셋
          }}
          maxLength={10}
          aria-invalid={!!beErrorMsg || !!feErrorMsg} // 8. [수정] FE/BE 에러 모두 반영
        />
        
        {/* 9. [수정] FE 유효성 에러 또는 BE 중복 에러 메시지 */}
        {(beErrorMsg || feErrorMsg) && (
          <p className="error-message">
            <img src={wrong_input} alt='오류 아이콘' className="error-icon"/>
            {beErrorMsg || feErrorMsg} {/* BE 에러를 우선 표시 */}
          </p>
        )}
        
        <button
          className="btn primary phone-btn"
          disabled={!isValid || loading}
          onClick={handleCompleteSignup}
        >
          {loading ? "가입 중..." : "다음"}
        </button>
      </div>
    </main>
  );
}