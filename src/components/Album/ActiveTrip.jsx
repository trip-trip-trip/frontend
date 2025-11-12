import React from 'react'
import './ActiveTrip.css'

const ActiveTrip = ({tripName, members, img, count}) => {
    console.log(tripName, members, img, count);
  return (
    <div className='active-trip-container'>
        <h2>활성 여행</h2>
          <div className="album-box">
            <div className="album-head">
              <div className="album-title">
                <h3>{tripName}</h3>
                <h3>LIVE</h3>
              </div>
              {/* 친구 수 + 1명(본인) 추가 */}
              <p>진행 중 - {(members.length) + 1}명 참여</p>
            </div>
            {img
                ? <div className="album-photo-grid">
                {img.map((imgs) => (
                <div className="photo-placeholder-item">
                <img src={imgs} alt="" />
                </div>
            ))}
          </div>
          :<></>}
            
            <div className="album-release">
              <p>여행이 끝나면 공개됩니다</p>
              <p className='album-shots'>{count}/24개 촬영 완료</p>
            </div>
          </div>
    </div>
  )
}

export default ActiveTrip