// import React from 'react';
// import './CreateTrip.css';
// import { useState, useEffect } from 'react'; 
// import search_icon from '/search.png';
// import Header from '../../components/Header/Header';
// import Navbar from '../../components/NavBar/NavBar';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext'; 


// const CreateTrip = () => {
//   const [name, setName] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [location, setLocation] = useState("");
//   const [image, setImage] = useState("");
//   const [searchFriend, setSearchFriend] = useState("");
//   const [selectedFriend, setSelectedFriend] = useState([]);

//   const navigate = useNavigate();
  

//   const { activeTripId, setActiveTripId } = useAuth(); 

  
  

//   const friendList = [
//     { name: '김멋사', profile: '/profile-img.png'},
//     { name: '김친구', profile: '/profile-img.png'},
//     { name: '이친구', profile: '/profile-img.png'},
//     { name: '최친구', profile: '/profile-img.png'},
//   ];

//   const filteredFriendList = friendList.filter(friend => friend.name.includes(searchFriend));

//   const toggleFriend = (friendName) => {
//     setSelectedFriend((prev) =>
//       prev.includes(friendName)
//         ? prev.filter((name) => name !== friendName)
//         : [...prev, friendName]
//     );
//   };

//   // 5. [병합] 여행 생성 버튼 핸들러
//   const handleCreateBtn = () => {
//     if( !name || !startDate || !endDate || !location){
//       alert('여행 이름, 기간, 위치를 모두 입력해주세요.');
//       return;
//     }

//     // (임시) 새 여행 ID 생성
//     const newTripId = `${name.replace(/\s/g, '-')}-${new Date().getTime()}`;

  
//     const newActiveTrip = {
//       id: newTripId, // 소린 코드 추가
//       title: name,
//       startDate: startDate,
//       endDate: endDate,
//       location: location,
//       members: selectedFriend,
//       count: 0,
//       image: [],
//       coverImage: image, 
//     }
    
//     // [소린] localStorage 저장 로직
//     localStorage.setItem(`tripInfo_${newTripId}`, JSON.stringify(newActiveTrip));
//     console.log("새 여행 정보 localStorage에 저장:", newActiveTrip);

//     // [소린] "활성 여행 ID" 전역 설정
//     setActiveTripId(newTripId);
    
//     console.log(newActiveTrip);
//     navigate('/trips');
//   }

//   return (
//     <div className='create-trip page-with-nav'> {/* .page-with-nav 추가 (Navbar 하단 여백) */}
//       <Header title={"새 여행"}/>
//       <div className='create-trip-container'>
//           <form action="" className='create-trip-form' onSubmit={(e) => e.preventDefault()}>
//           <div className="create-trip-name">
//             <h3>여행 이름</h3>
//             <div className="input-field">
//               <input type="text" value={name} placeholder='예: 제주도 가족여행' onChange={(e)=>setName(e.target.value)}/>
//             </div>
//             <h3>여행 기간</h3>
//             <div className="date-form">
//               <input type="date" value={startDate} date-placeholder='여행 시작일' onChange={(e)=>setStartDate(e.target.value)}/>
//               <p>~</p>
//               <input type="date" value={endDate} date-placeholder='여행 종료일' onChange={(e)=>setEndDate(e.target.value)}/>
//             </div>
//             <h3>위치</h3>
//             <div className="input-field">
//               <input type="text" value={location} placeholder='여행지를 입력하세요' onChange={(e)=>setLocation(e.target.value)}/>
//             </div>
//             <h3>앨범 커버사진</h3>
//             <div className="input-field">
//                 <input
//                   type="file" // [수정] type="image" -> "file"로 변경
//                   accept="image/*"
//                   onChange={(e) => {
//                     const file = e.target.files?.[0];
//                     if (!file) return;
//                     setImage(file); // (setImage는 파일 객체를 저장)
//                   }}
//                 />
//             </div>
//             <div className="add-friend">
//               <div className="friend-head">
//                 <h3>친구 초대</h3>
//                   <div className="friend-search">
//                     <img src={search_icon} alt="검색" className='search-icon'/>
//                     <input type="search" placeholder='친구 검색' onChange={(e)=>setSearchFriend(e.target.value)} className='friend-search-bar'/>
//                   </div>

//               </div>
//               <div className="friend-list">
//                 {filteredFriendList.map((friend) => (
//                   <div className="friend-list-row" key={friend.name}>
//                     <div className="friend-profile">
//                       <img src={friend.profile} alt="" className='profile-img'/>
//                       <p>{friend.name}</p>
//                     </div>
//                     <input type="checkbox" 
//                       checked={selectedFriend.includes(friend.name)}
//                       onChange={() => toggleFriend(friend.name)}/>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           {/* [수정] <form>이 <button>을 감싸도록 수정 */}
//           <button className='create-trip-btn' onClick={handleCreateBtn}>만들기</button>
//         </div>
//         </form>
//       </div>
//       <Navbar/>
//     </div>
//   )
// }

// export default CreateTrip

import React from 'react';
import './CreateTrip.css';
import { useState, useEffect } from 'react'; 
import search_icon from '/search.png';
import Header from '../../components/Header/Header';
import Navbar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; 

// 1. API_BASE 정의 (다른 파일에서 가져옴)
const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';


const CreateTrip = () => {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState("");
    const [searchFriend, setSearchFriend] = useState("");
    const [selectedFriend, setSelectedFriend] = useState([]);

    const navigate = useNavigate();
    
  // 2. [수정] API 호출을 위해 'token'을 함께 가져옵니다.
    const { token, activeTripId, setActiveTripId } = useAuth(); 

    

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

    // 3. [핵심 수정] 여행 생성 버튼 핸들러 (API 연동)
    const handleCreateBtn = async () => { // 👈 async 함수로 변경
        
    // 4. 폼 유효성 검사 (API 기준으로는 name, startDate, endDate만)
    if( !name || !startDate || !endDate ){
            alert('여행 이름과 기간을 모두 입력해주세요.');
            return;
        }

    if (!token) {
      alert("로그인 토큰이 없습니다. 다시 로그인해주세요.");
      return;
    }

    // 5. API Request Body 생성
    const newTripData = {
      title: name, // 👈 폼의 'name'을 API의 'title'로 매칭
      startDate: `${startDate}T00:00:00`, // 👈 폼의 'YYYY-MM-DD'를 'T12:00' (또는 T00:00) 형식으로
      endDate: `${endDate}T00:00:00`,   // 👈 (API 명세서가 DateTime을 요구)

      // 🚨 주의: API가 요구하는 아래 두 값은 현재 폼에 없습니다!
      // 🚨 임시값으로 하드코딩합니다. (추후 폼 수정 필요)
      description: "new trip description", // 👈 (임시 하드코딩)
      placeId: 11 // 👈 (임시 하드코딩, 폼의 'location'은 문자열이라 사용 불가)
    };

    console.log("새 여행 생성 API 호출:", newTripData);

    try {
      // 6. 백엔드 API 호출
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
              members: selectedFriend,
              count: 0,
              image: [],
              coverImage: image, 
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
    // ... (JSX 코드는 수정할 필요 없습니다. 그대로 둡니다) ...
        <div className='create-trip page-with-nav'> 
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
            {/* ... (나머지 폼 동일) ... */}
                        <h3>앨범 커버사진</h3>
                        <div className="input-field">
                                <input
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setImage(file); 
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
                            _MODIFIED_AT 2024-06-19T06:40:40.812Z
                                    </div>
                                ))}
                            </div>
                        </div>
                    <button className='create-trip-btn' onClick={handleCreateBtn}>만들기</button>
                </div>
                </form>
            </div>
            <Navbar/>
        </div>
    )
}

export default CreateTrip