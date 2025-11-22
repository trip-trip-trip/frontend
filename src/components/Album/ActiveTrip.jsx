import React from 'react'
import './ActiveTrip.css'
import activeTripImg from '/ticket_active.png'
import camera_btn from '/icons/goto-camera.png'
import { useNavigate } from 'react-router-dom'
import location_icon from '/icons/location_icon.png'
import film_icon from '/icons/film_icon.png'
import vid_icon from '/icons/vid_icon.png'
import members_icon from '/icons/members_icon.png'
import camera_icon from '/icons/camera_icon.png'
import write_icon from '/icons/write_icon.png'

const ActiveTrip = ({tripId, tripName, title, startDate, endDate, members, filmCount, vidCount}) => {
    const navigate = useNavigate();

    // 카메라 버튼 핸들러
    const handleCameraClick = (e) => {
      e.stopPropagation();
      navigate(`/camera/${tripId}`, {state: {tripState: 'active'}} );
  }

  // 수정 버튼 핸들러
  const handleEditClick = (e) => {
      e.stopPropagation();
      navigate(`trips/detail/${tripId}/edit`); 
  }

  return (
    <div className='active-trip-container' onClick={()=>navigate(`/trips/detail/${tripId}`, {
      state: {
          tripState: 'active',
          tripId: tripId,
          title: title,  
          startDate: startDate,
          endDate: endDate,
          members:members,
      }
    })}>
      <div className="active-header">
        <div className="active-trip-title">
          <h2>지금 <span>{tripName}</span> 여행중 </h2>
        </div>
        <div className="active-trip-members">
          {/* 친구 수 + 1명(본인) 추가 */}
          <h5><span>{(members.length) + 1}명</span> | {startDate?.slice(2).split('-').join('.')} ~ {endDate.slice(2).split('-').join('.')}</h5>
        </div>
      </div>

      <div className="active-album-box">
        {/* 배경 이미지 */}
        <div className="active-box-img">
          <img src={activeTripImg} alt="" className='active-box'/>
        </div>
        <div className="ticket-content">
          <h1 className='ticket-title'>Now Traveling</h1>
          <div className="active-info-cont">
            {/* 티켓 왼쪽 */}
            <div className="active-ticket-detail">
              <div className="active-album-date">
                <h5 className='left-date'>{startDate.split('-')}</h5>
                <p>-------------</p>
                <h5 className='right-date'>{endDate.split('-')}</h5>              
              </div>

              <div className="active-trip-info">
                <div className="active-line">
                  <div className="active-item">
                    <img src={location_icon} alt="" className='ticket-icon big'/>
                    <h4 className='info-box'>{tripName}</h4>
                  </div>
                  <div className="active-item">
                    <img src={film_icon} alt="" className='ticket-icon'/>
                    <h4 className='info-box'>{filmCount}<span> / 24</span></h4>
                  </div>
                </div>
                <div className="active-line">
                  <div className="active-item">
                    <img src={members_icon} alt="" className='ticket-icon big'/>
                    <h4 className='info-box'>{(members.length) + 1} <span>명 참여 중</span></h4>
                  </div>
                  <div className="active-item">
                    <img src={vid_icon} alt="" className='ticket-icon'/>
                    <h4 className='info-box'>{vidCount || 0}</h4>
                  </div>
                </div>
              </div>
            </div>

            {/* 티켓 오른쪽 */}
            <div className="goto-camera">
              <img src={camera_btn} alt="" className='goto-camera-btn' onClick={handleCameraClick} />
              <div className="goto-camera-cont">
                  <img src={camera_icon} alt="" />
                  <h6>촬영하기</h6>
                  <div className="left-pic-num">{24 - filmCount}장 남음</div>
            </div>
            </div>

          </div>
        </div>
        
          </div>
          
            <button onClick={handleEditClick}>
            <div className="main-edit-btn" >
              <img src={write_icon} alt="" />
              <p>수정하기</p>
          </div>
            </button>
        </div>
      
  )
}

export default ActiveTrip