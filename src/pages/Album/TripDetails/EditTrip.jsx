import React from 'react'
import './EditTrip.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import edit_icon from '/icons/edit_btn.png'

const tripInfo = {
                "id": 20,
                "ownerId": 10,
                "place": "Seoul",
                "title": "2025 서울 랜드마크 여행",
                "description": "남산타워와 한강을 중심으로 한 5일간의 여행",
                "visibility": "FRIENDS",
                "status": "ACTIVE", 
                "startDate": "2025-10-15",
                "endDate": "2025-10-20",
                "inviteesProfileImgList": [
                    "daisy_traveler",
                    "ethan_explorer",
                    "alice_traveler"
                ],
                "inviteesNameList": [
                    "https://placehold.co/100x100/f0e68c/000000?text=D",
                    "https://placehold.co/100x100/ffa500/000000?text=E",
                    "https://placehold.co/100x100/1e90ff/ffffff?text=A"
                ],
                "inviteesTagList": [
                    "daisy1234",
                    "ethan1234",
                    "alice1234"
                ]
              };

const EditTrip = () => {
  const [name, setName] = useState(tripInfo.title);
  const [startDate, setStartDate] = useState(tripInfo.startDate);
  const [endDate, setEndDate] = useState(tripInfo.endDate);
  const [oneday, setOneday] = useState(false);

  const [place, setPlace] = useState(tripInfo.place);
  const tripStatus = tripInfo.status; 
  
  // 🚀 여행 상태가 'COMPLETED'인지 확인하는 변수
  const isCompleted = tripStatus === 'COMPLETED'; 

  const navigate = useNavigate();
  const location = useLocation();

  const handleEditBtn = () => {
    console.log(name, startDate, endDate, place );
    // 여기에 여행 정보 PATCH 추가
  }

  const handlePlaceEdit = () => {
    navigate('/trips/places')
  }
    
  return (
    <div className='edit-trip'>
        <Header toBack={true}/>
        <div className="edit-trip-cont">
        <form action="" className='edit-trip-form' onSubmit={(e) => e.preventDefault()}>
          <div className="edit-trip-name">
            <div className="edit-trip-title">
              <img src={edit_icon} alt="" />
              <h2>여행 수정</h2>
            </div>
            <h3>제목</h3>
            <div className="input-field">
              <input type="text" value={name} maxLength={7} placeholder='예: 제주도 가족여행' onChange={(e)=>setName(e.target.value)} />
            </div>
            <h3>일정</h3>
            {!isCompleted && 
              <div className="oneday-check" hidden={isCompleted}>
                <input type="checkbox" onClick={()=>setOneday(!oneday)}/>
                <h4>당일치기</h4>
              </div>
            }

            { oneday
            ? <div className="date-form oneday">
                <input 
                  type="date" 
                  value={startDate} 
                  date-placeholder='여행 시작일' 
                  onChange={(e)=>{setStartDate(e.target.value), setEndDate(e.target.value)}}
                  disabled={isCompleted}
                  className={`date-form ${isCompleted}`}
                />
              </div> 
            : <div className="date-info">
                <div className="date-form">
                  {/* 완료된 여행은 날짜 입력 필드 비활성화 */}
                  <input 
                    type="date" 
                    value={startDate} 
                    date-placeholder='여행 시작일' 
                    onChange={(e)=>setStartDate(e.target.value)}
                    disabled={isCompleted}
                    className={`date-form ${isCompleted}`}
                  />
                  <p>부터</p>
                </div>
                <div className="date-form">
                  {/* 완료된 여행은 날짜 입력 필드 비활성화 */}
                  <input 
                    type="date" 
                    value={endDate} 
                    date-placeholder='여행 종료일' 
                    onChange={(e)=>setEndDate(e.target.value)}
                    className={`date-form ${isCompleted}`}
                    />
                  <p>까지</p>
                </div>
              </div>
            }
            <h3>장소</h3>
            <div className="place-info-row">
              <div className="place-info">
                <h4>{place}</h4>
              </div>
              {!isCompleted
              ? <h4 className='to-edit-complete' onClick={handlePlaceEdit}>변경하기 &gt;</h4>
              : 
                <h4 className='no-edit'>*이미 지난 여행의 일정과 장소는 바꿀 수 없어요.</h4>
              }

            </div>

            </div>
          </form>
          
          {
            name && startDate && endDate && place &&
            <div className="edit-trip-btn-cont">
              <button className='edit-trip-btn' onClick={handleEditBtn}>여행 수정하기</button>
            </div>
          }
        </div>
        <Navbar/>
    </div>
  )
}

export default EditTrip