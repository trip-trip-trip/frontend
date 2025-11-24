import React from 'react'
import './UpcomingTrip.css'
import upcomingTripImg from '/ticket_upcoming.png'
import edit_btn from '/upcoming_edit.png'
import { useNavigate } from 'react-router-dom'
import location_icon from '/icons/location_icon.png'
import members_icon from '/icons/members_icon.png'
import edit_icon from '/upcoming_edit_btn.png'
import write_icon from '/icons/write_icon.png'

const Upcoming = ({placeName, tripId, tripName, title, startDate, endDate, members, filmCount, vidCount}) => {
    const navigate = useNavigate();

  // 수정 버튼 핸들러
  const handleEditClick = (e) => {
      e.stopPropagation();
      navigate(`/trips/detail/${tripId}/edit`); 
  }

  return (
    <div className='upcoming-trip-container'>
      <div className="upcoming-album-box">
        {/* 배경 이미지 */}
        <div className="upcoming-box-img">
          <img src={upcomingTripImg} alt="" className='upcoming-box'/>
        </div>
        <div className="upcoming-ticket-content">
          <h1 className='upcoming-ticket-title'>Now Traveling</h1>
          <div className="upcoming-info-cont">
            {/* 티켓 왼쪽 */}
            <div className="upcoming-ticket-detail" onClick={()=>navigate(`/trips/detail/${tripId}`, {
              state: {
                  tripState: 'upcoming',
                  tripId: tripId,
                  title: title,  
                  startDate: startDate,
                  endDate: endDate,
                  members:members,
              }
            })}>
                <div className="upcoming-info">
                        
                        <div className="upcoming-album-date">
                        <div className="date-box">DATE</div>
                        <h5 className='left-date'>{startDate.split('-')}</h5>
                        <p>-----</p>
                        <h5 className='right-date'>{endDate.split('-')}</h5>              
                        </div>
                <div className="upcoming-title-cont">
                    <div className="date-box">TITLE</div>
                    <h2 className='upcoming-title'>{title}</h2>
                </div>
                </div>
              
              <div className="upcoming-trip-info">
                <div className="upcoming-line">
                  <div className="upcoming-item">
                    <img src={location_icon} alt="" className='ticket-icon big'/>
                    <h4 className='info-box'>{placeName}</h4>
                  </div>
                  <div className="upcoming-item">
                    <img src={members_icon} alt="" className='ticket-icon big'/>
                    <h4 className='info-box'>{(members.length)} <span>명 참여 중</span></h4>
                  </div>
                </div>
              </div>
            </div>

            {/* 티켓 오른쪽 */}
            <div className="goto-edit" onClick={handleEditClick}>
              <img src={edit_btn} alt="" className='goto-edit-btn'/>
              <div className="goto-edit-cont">
                  <img src={edit_icon} alt="" />
                  <h6>수정하기</h6>
            </div>
            </div>

          </div>
        </div>
        
          </div>
        </div>
      
  )
}

export default Upcoming