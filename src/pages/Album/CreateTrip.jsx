import React from 'react';
import './CreateTrip.css';
import { useState, useEffect } from 'react'; 
import search_icon from '/search.png';
import Header from '../../components/Header/Header';
import Navbar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 


const CreateTrip = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");
  const [searchFriend, setSearchFriend] = useState("");
  const [selectedFriend, setSelectedFriend] = useState([]);

  const navigate = useNavigate();
  

  const { activeTripId, setActiveTripId } = useAuth(); 

  
  // useEffect(() => {
  //   if (activeTripId) {
  //      alert("이미 진행 중인 활성 여행이 있습니다. 새 여행을 만들 수 없습니다.");
  //     navigate('/trips'); // 앨범 페이지로 튕겨내기
  //   }
  // }, [activeTripId, navigate]);


  const friendList = [
    { name: '김멋사', profile: '/profile-img.png'},
    { name: '김친구', profile: '/profile-img.png'},
    { name: '이친구', profile: '/profile-img.png'},
    { name: '최친구', profile: '/profile-img.png'},
  ];

  const filteredFriendList = friendList.filter(friend => friend.name.includes(searchFriend));

  const toggleFriend = (friendName) => {
    setSelectedFriend((prev) =>
      prev.includes(friendName)
        ? prev.filter((name) => name !== friendName)
        : [...prev, friendName]
    );
  };

  // 5. [병합] 여행 생성 버튼 핸들러
  const handleCreateBtn = () => {
    if( !name || !startDate || !endDate || !location){
      alert('여행 이름, 기간, 위치를 모두 입력해주세요.');
      return;
    }

    // (임시) 새 여행 ID 생성
    const newTripId = `${name.replace(/\s/g, '-')}-${new Date().getTime()}`;

  
    const newActiveTrip = {
      id: newTripId, // 소린 코드 추가
      title: name,
      startDate: startDate,
      endDate: endDate,
      location: location,
      members: selectedFriend,
      count: 0,
      image: [],
      coverImage: image, 
    }
    
    // [소린] localStorage 저장 로직
    localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newActiveTrip));
    console.log("새 여행 정보 localStorage에 저장:", newActiveTrip);

    // [소린] "활성 여행 ID" 전역 설정
    setActiveTripId(newTripId);
    
    console.log(newActiveTrip);
    navigate('/trips');
  }

  return (
    <div className='create-trip page-with-nav'> {/* .page-with-nav 추가 (Navbar 하단 여백) */}
      <Header title={"새 여행"}/>
      <div className='create-trip-container'>
          <form action="" className='create-trip-form' onSubmit={(e) => e.preventDefault()}>
          <div className="create-trip-name">
            <h3>여행 이름</h3>
            <div className="input-field">
              <input type="text" value={name} placeholder='예: 제주도 가족여행' onChange={(e)=>setName(e.target.value)}/>
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
                <input
                  type="file" // [수정] type="image" -> "file"로 변경
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setImage(file); // (setImage는 파일 객체를 저장)
                  }}
                />
            </div>
            <div className="add-friend">
              <div className="friend-head">
                <h3>친구 초대</h3>
                  <div className="friend-search">
                    <img src={search_icon} alt="검색" className='search-icon'/>
                    <input type="search" placeholder='친구 검색' onChange={(e)=>setSearchFriend(e.target.value)} className='friend-search-bar'/>
                  </div>

              </div>
              <div className="friend-list">
                {filteredFriendList.map((friend) => (
                  <div className="friend-list-row" key={friend.name}>
                    <div className="friend-profile">
                      <img src={friend.profile} alt="" className='profile-img'/>
                      <p>{friend.name}</p>
                    </div>
                    <input type="checkbox" 
                      checked={selectedFriend.includes(friend.name)}
                      onChange={() => toggleFriend(friend.name)}/>
                  </div>
                ))}
              </div>
            </div>
          {/* [수정] <form>이 <button>을 감싸도록 수정 */}
          <button className='create-trip-btn' onClick={handleCreateBtn}>만들기</button>
        </div>
        </form>
      </div>
      <Navbar/>
    </div>
  )
}

export default CreateTrip