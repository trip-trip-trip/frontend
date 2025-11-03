import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './Login.css';
import googleLogo from '../../assets/Group.png'
import kakaoLogo from '../../assets/symbol-kakao.png'


const Login = () => {
  const navigate = useNavigate();
  useEffect(()=>{
    if(window.Kakao&&!window.Kakao.isInitialized()){
        window.Kakao.init('928be3539586d5c856cf5e36be2a0724');
        console.log('Kakao SDK initialized');
    }
}, []);

  const handleGoogleLogin = () => {
    if (!window.google || !window.google.accounts) {
      alert('Google SDK가 로드되지 않았습니다.');
      return;
    }

  window.google.accounts.id.initialize({
      client_id:
        '364312669525-jj81n7v5l54c8i80gajft74dvg956b29.apps.googleusercontent.com',
      callback: async (response) => {
        console.log('Google ID Token:', response.credential);

        try {
          ///////////
          // const res = await fetch('http://localhost:4000/auth/google', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ token: response.credential }),
          // });

          // const data = await res.json();
          // console.log('서버 응답:', data);

          navigate('/');
        } catch (err) {
          console.error('서버 통신 에러:', err);
          alert('구글 로그인 중 오류가 발생했습니다.');
        }
      },
    });

    window.google.accounts.id.prompt(); // 로그인 창 표시
  };

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      alert('카카오 SDK가 로드되지 않았습니다.');
      return;
    }

    window.Kakao.Auth.login({
      scope: 'profile_nickname, profile_image',
      success: async function (authObj) {
        console.log('Kakao 로그인 성공:', authObj);
        // authObj.access_token => 백엔드로 전송 후 사용자 정보 요청

        try {
          // api key 넣기
          // const response = await fetch('http://localhost:4000/auth/kakao', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ token: authObj.access_token }),
          // });
        // const data=await response.json();
        // console.log('서버 응답:', data);
        navigate('/'); //성공 후 홈으로 이동
        } catch(err){
          console.log('서버 통신 에러:', err);
          alert('로그인 중 오류가 발생했습니다.');
        }
      },
      fail: function (err){
        console.error('Kakao 로그인 실패:', err);
    },
    });
  };
  
  return (
    <main className="login">
      <h1 className="lg-title">환영합니다</h1>

      <div className="lg-field">
        <label htmlFor="email">이메일</label>
        <input id="email" type="email" placeholder="이메일을 입력하세요" />
      </div>

      <div className="lg-field">
        <label htmlFor="password">비밀번호</label>
        <input id="password" type="password" placeholder="비밀번호를 입력하세요" />
      </div>

      <button className="kakao-login" onClick={handleKakaoLogin} >
        <img src={kakaoLogo} alt="" className="social-icon" />
        카카오 계정으로 계속하기
      </button>

      <button className="google-login" onClick={handleGoogleLogin}>
        <img src={googleLogo} alt="" className="social-icon" />
        구글 계정으로 계속하기
        </button>


      <button
        type="button"
        className="go-login"
        onClick={() => navigate('/')}
        aria-label="로그인"
      >
        로그인
      </button>
    </main>
  );
};

export default Login;
