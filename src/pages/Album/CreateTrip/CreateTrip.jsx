import React from 'react';
import './CreateTrip.css';
import { useState, useEffect } from 'react'; 
import Header from '../../../components/Header/Header';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext'; 

// 1. API_BASE 정의 (다른 파일에서 가져옴)
const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';


const CreateTrip = () => {

  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [oneday, setOneday] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { selectedPlace } = location.state;
    
  // 2. [수정] API 호출을 위해 'token'을 함께 가져옵니다.
    const { token, activeTripId, setActiveTripId } = useAuth(); 

    // 3. [핵심 수정] 여행 생성 버튼 핸들러 (API 연동)
    const handleCreateBtn = async () => { // 👈 async 함수로 변경
    if (activeTripId){
      alert("이미 생성된 여행이 있습니다. 해당 여행이 끝난 후 새 여행 생성이 가능합니다.");
    }
    // 4. 폼 유효성 검사 (API 기준으로는 name, startDate, endDate만)
    if( !name || !startDate || !endDate ){
            alert('여행 이름과 기간을 모두 입력해주세요.');
            return;
        }

    if (!token) {
      alert("로그인 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    console.log(selectedPlace);

    const newTripData = {
      title: name, // 👈 폼의 'name'을 API의 'title'로 매칭
      startDate: `${startDate}T00:00:00`, // 👈 폼의 'YYYY-MM-DD'를 'T12:00' (또는 T00:00) 형식으로
      endDate: `${endDate}T00:00:00`,   // 👈 (API 명세서가 DateTime을 요구)
      description: "",
      placeId: selectedPlace.id
    };

    console.log("새 여행 생성 API 호출:", newTripData);

    try {
      const response = await fetch(`${API_BASE}/trips`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTripData)
      });

      const data = await response.json();

      if (!data.isSuccess) {
        throw new Error(data.message || "여행 생성 실패");
      }

      // 7. [!!!] 서버로부터 "숫자 ID"를 받습니다.
      const numericTripId = data.result.id;
      console.log("서버로부터 받은 새 여행 ID (숫자):", numericTripId);

      // 8. [!!!] "활성 여행 ID"로 "숫자 ID"를 전역 설정합니다.
      // (이것이 500 에러를 해결하는 핵심입니다)
      setActiveTripId(numericTripId);

      // (선택) 기존 localStorage 로직도 숫자 ID를 사용하도록 업데이트
      const newActiveTrip = {
              id: numericTripId, // 👈 문자열 ID 대신 숫자 ID 사용
              title: name,
              startDate: startDate,
              endDate: endDate,
              location: location,
              members: [],
              vid_count: 0,
              film_count: 0,
              image: [],
              coverImage: '', 
          }
          localStorage.setItem(`tripInfo_${numericTripId}`, JSON.stringify(newActiveTrip));

      console.log("새 여행 정보 localStorage에 저장:", newActiveTrip);
          navigate('/trips');

    } catch (err) {
      console.error("여행 생성 API 호출 실패:", err);
      alert(`여행 생성에 실패했습니다: ${err.message}`);
    }

    }


  return (
    <div className='create-trip page-with-nav'> {/* .page-with-nav 추가 (Navbar 하단 여백) */}
      <Header toBack={true}/>
      <div className='create-trip-container'>
          <form action="" className='create-trip-form' onSubmit={(e) => e.preventDefault()}>
          <div className="create-trip-name">
            <h3>여행, 어디로 떠나시나요?</h3>
            <div className="input-field">
              <input type="text" value={name} placeholder='예: 제주도 가족여행' onChange={(e)=>setName(e.target.value)} />
            </div>
            <h3>여행 일정을 알려주세요</h3>
            <div className="oneday-check">
              <input type="checkbox" onClick={()=>setOneday(!oneday)}/>
              <h4>당일치기</h4>
            </div>
            { oneday
            ? <div className="date-form oneday">
                <input type="date" value={startDate} date-placeholder='여행 시작일' onChange={(e)=>{setStartDate(e.target.value), setEndDate(e.target.value)}}/>
              </div> 
            : <div className="date-info">
                <div className="date-form">
                  <input type="date" value={startDate} date-placeholder='여행 시작일' onChange={(e)=>setStartDate(e.target.value)}/>
                  <p>부터</p>
                </div>
                <div className="date-form">
                  <input type="date" value={endDate} date-placeholder='여행 종료일' onChange={(e)=>setEndDate(e.target.value)}/>
                  <p>까지</p>
                </div>
              </div>
            }

            </div>
          </form>
          {/* [수정] <form>이 <button>을 감싸도록 수정 */}
          {
                name && startDate && endDate && location &&
                <div className="create-trip-btn-cont">
                  <button className='create-trip-btn' onClick={handleCreateBtn}>여행 만들기!</button>
                </div>
              }
          </div>
        </div>
    )
}

export default CreateTrip