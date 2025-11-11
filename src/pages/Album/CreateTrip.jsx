import React from 'react';
import './CreateTrip.css';
import { useState, useEffect } from 'react'; // 1. useEffect 임포트
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // 2. AuthContext 임포트

const CreateTrip = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  
  const navigate = useNavigate();
  // 3. AuthContext에서 '활성 ID'와 '설정 함수' 가져오기
  const { activeTripId, setActiveTripId } = useAuth(); 

  // 4. [추가] "활성 여행이 있으면 접근 금지" 규칙 적용
  useEffect(() => {
    if (activeTripId) {
      //alert("이미 진행 중인 활성 여행이 있습니다. 새 여행을 만들 수 없습니다.");
      navigate('/trips'); // 앨범 페이지로 튕겨내기
    }
  }, [activeTripId, navigate]);


  const friendList = [
    {
      name: '김멋사',
      profile: '/profile-img.png'
    },
    {
      name: '김친구',
      profile: '/profile-img.png'
    },
    {
      name: '이친구',
      profile: '/profile-img.png'
    },
    {
      name: '최친구',
      profile: '/profile-img.png'
    },
  ];

  // "만들기" 버튼 핸들러
  const handleCreateTrip = (e) => {
    e.preventDefault(); // 새로고침 방지
    
    // (임시) 새 여행 ID 생성 (공백을 '-'로 변경)
    const newTripId = `${name.replace(/\s/g, '-')}-${new Date().getTime()}`;

    // (임시) 새 여행 정보 객체
    const newTrip = { 
      id: newTripId,
      title: name,
      dateRange: `${startDate} ~ ${endDate}`,
      location: location,
      coverImage: image,
    };
    
    // (임시) localStorage에 '여행 정보' 저장 (Album.jsx가 읽을 용도)
    localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newTrip));
    console.log("새 여행 정보 localStorage에 저장:", newTrip);

    // [핵심] 이 ID를 "활성 여행 ID"로 전역 설정
    setActiveTripId(newTripId);
    
    // 앨범 페이지로 이동
    navigate('/trips'); 
  };

  return (
    <div className='create-trip page-with-nav'> 
      <div className='create-trip-container'>
        
        <header className="create-trip-header">
          <button className="back-button" type="button" onClick={() => navigate(-1)}>
            &lt;
          </button>
          <h2>새 여행</h2>
          <button 
            className="create-button" 
            type="submit"
            form="create-trip-form"
          >
            만들기
          </button>
        </header>

        <form 
          id="create-trip-form" 
          className='create-trip-form' 
          onSubmit={handleCreateTrip}
        >
          <div className="create-trip-name">
            <h3>여행 이름 *</h3>
            <div className="input-field">
              <input 
                type="text" 
                value={name} 
                placeholder='예: 제주도 가족여행' 
                onChange={(e)=>setName(e.target.value)}
                required 
              />
            </div>
            <h3>여행 기간</h3>
            <div className="date-form">
              <input type="date" value={startDate} date-placeholder='여행 시작일' onChange={(e)=>setStartDate(e.target.value)}/>
              <p>~</p>
              <input type="date" value={endDate} date-placeholder='여행 종료일' onChange={(e)=>setEndDate(e.target.value)}/>
            </div>
            <h3>위치</h3>
            <div className="input-field">
              <input type="text" value={location} placeholder='여행지를 입력하세요' onChange={(e)=>setLocation(e.target.value)}/>
            </div>
            <h3>앨범 커버사진</h3>
            <div className="input-field">
              {/* (참고: type="image"는 버튼입니다. 파일 업로드는 type="file"을 쓰셔야 합니다) */}
              <input type="image" value={image} placeholder='사진 업로드' onChange={(e)=>setImage(e.target.value)}/>
            </div>
            <div className="add-friend">
              <div className="friend-head">
                <h3>친구 초대</h3>
                <form>
                  <img src alt="" className='search-icon'/>
                  <input type="search" placeholder='친구 검색'/>
                </form>
                <input type="search" placeholder='친구 검색'>
                  <div className="search-bar">
                    <img src="" alt="" />
                  </div>
                </input>

              </div>
              <div className="friend-list">
                {friendList.map((friend) => (
                  <div className="friend-list-row" key={friend.name}>
                    <div className="friend-profile">
                      <img src={friend.profile} alt="" className='profile-img'/>
                      <p>{friend.name}</p>
                    </div>
                    <input type="checkbox" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>
      
    </div>
  )
}

export default CreateTrip;