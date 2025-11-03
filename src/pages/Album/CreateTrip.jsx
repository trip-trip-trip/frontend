import React from 'react'
import './CreateTrip.css'
import { useState } from 'react';

const CreateTrip = () => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState("");

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

  return (
    <div className='create-trip'>
      <div className='create-trip-container'>
        
          <form action="" className='create-trip-form'>
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
              <input type="image" value={image} placeholder='사진 업로드' onChange={(e)=>setImage(e.target.value)}/>
            </div>
            <div className="add-friend">
              <div className="friend-head">
                <h3>친구 초대</h3>
                <input type="search" placeholder='친구 검색' />
              </div>
              <div className="friend-list">
                {friendList.map((friend) => (
                  <div className="friend-list-row">
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

export default CreateTrip