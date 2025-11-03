import './EndedTripItem.css'
import React from 'react'

const EndedTripItem = ( {title, dateRange, members, count} ) => {
  return (
    <div className='EndedTripItem'>
        <div className="end-trip-head">
            <div className="end-trip-title">
            <h3>{title}</h3>
            <h3>{count}장</h3>
            </div>
            <p>{dateRange} - {members}명 참여</p>
        </div>
    </div>
  )
}

export default EndedTripItem