import { useNavigate } from 'react-router-dom'
import './EndedTripItem.css'
import React from 'react'

const EndedTripItem = ( {title, startDate, endDate, members, count, image} ) => {
    const navigate = useNavigate();
  return (
    <div className='EndedTripItem' onClick={()=>navigate('/trips/detail')}>
        <div className="end-trip-head">
            <div className="end-trip-title">
            <h3>{title}</h3>
            <h3>{count}장</h3>
            </div>
            <p>{startDate} ~ {endDate} &nbsp; | &nbsp; {members.length + 1}명 참여</p>
        </div>
        <div className="main-image">
          <img src={image} alt='' className='main-image-pic'/>
        </div>
    </div>
  )
}

export default EndedTripItem