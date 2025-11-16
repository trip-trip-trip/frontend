import React from 'react'
import './friendRequest.css'

const FriendRequest = ({img, tripName, userName, onAccept, onReject}) => {
  return (
    <div className='friend-request'>
        <h2>여행을 함께 하시겠습니까?</h2>
        <div className="request-trip-cont">
            <div className="request-trip-info">
                <img src={img[0]} alt="" className='request-trip-img'/>
                <div className="request-trip-name">
                    <h2>{tripName}</h2>
                    <h3>{userName}</h3>
                </div>
            </div>
            <div className="request-btn-cont">
                <button className='request-btn accept' onClick={onAccept}>수락</button>
                <button className='request-btn reject' onClick={onReject}>거절</button>
            </div>
        </div>
    </div>
  )
}

export default FriendRequest