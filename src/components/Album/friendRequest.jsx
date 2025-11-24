import React from 'react'
import './friendRequest.css'
import alert_icon from '/icons/alert.png'
import next_icon from '/icons/next.png'
import { useNavigate } from 'react-router-dom'

const FriendRequest = ({data}) => {
    const navigate = useNavigate();
    const dateOnly = data.createdAt.split('T')[0];
  return (
    <div className='friend-request'>
        <div className="invitation-alert">
            <img src={alert_icon} alt="" />
            <p>여행 초대 알림</p>
        </div>
        <div className="request-trip-cont">
            <h3>{dateOnly}</h3>
            <div className="request-trip-info">
                <img src={data.inviterProfileImg} alt="" className='request-trip-img'/>
                <h3 className='request-trip-text'><span>{data.inviterName}</span>님이 <span>{data.tripName}</span> 여행에 초대했어요</h3>
            </div>
            <h6 onClick={()=>navigate(`/trips/detail/${data.tripId}`, {state: {invite:true, invitationId: data.invitationId}})}>
                확인하기<img src={next_icon} alt="" className='check-next'/></h6>
        </div>
    </div>
  )
}

export default FriendRequest