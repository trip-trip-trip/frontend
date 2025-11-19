import { useNavigate } from 'react-router-dom'
import './EndedTripItem.css'
import React from 'react'
import ended_trip from '/complete_trip.png'
import SharedFriends from './sharedFriends'

const EndedTripItem = ( {tripId, title, startDate, endDate, members, coverImage, images} ) => {
  const navigate = useNavigate();
  // const handleClick = () => {
  //   navigate(`/trips/detail/${tripId}`);
  // }
  
  return (
    <div className='EndedTripItem' onClick={()=>navigate(`/trips/detail/${tripId}`, {
      state: {
          tripId: tripId,
          title: title,  
          startDate: startDate,
          endDate: endDate,
          members:members,
          coverImage:coverImage,
          images:images
      }
    })}>
      <div className="end-trip-container">
        <div className="end-trip-bg">
          <img src={ended_trip} alt="" className='end-trip-img'/>
        </div>
        <div className="end-trip-head">
            <h3 className="end-trip-title">{title}</h3>
            <p className='end-trip-date'>{startDate.split('-')} ------ {endDate.split('-')}</p>
        </div>
        <div className="end-trip-content">
          <div className="main-image">
            <img src={coverImage} alt='' className='main-image-pic'/>
          </div>
          <div className="end-trip-info">
            <div className="end-info-line">
              <h1>Location</h1>
              <h2>{title}</h2>
            </div>
            <div className="end-info-line">
              <h1>People</h1>
              <SharedFriends data={members}/>
            </div>
            <div className="end-info-line">
              <h1>Photos</h1>
              <div className="main-photo-cont">
              <div className='main-photo-grid'>
                  {images.slice(0,6).map((img, index)=>(
                      <div key={index} className='main-photo-item'>
                          <img src={img} alt="" />
                      </div>
                  ))}
                </div>
            </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  )
}

export default EndedTripItem
