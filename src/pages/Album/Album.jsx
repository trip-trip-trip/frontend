import React from 'react'
import './Album.css'
import EndedTripItem from '../../components/Album/EndedTripItem';

const Album = () => {

  const completedTrips = [
    {
      title: '부산 여행',
      dateRange: '2024.02.20-23',
      members: 3,
      count: 24,
      image: '/trip-img/trip1.jpeg',
    },
    {
      title: '경주 여행',
      dateRange: '2021.03.05-06',
      members: 3,
      count: 24,
      image: '/trip-img/trip2.jpeg'
    },
  ];

  return (
    <div className='album'>
        <div className="album-container">
          <h2>활성 여행</h2>
          <div className="album-box">
            <div className="album-head">
              <div className="album-title">
                <h3>제주도 여행</h3>
                <h3>LIVE</h3>
              </div>
              <p>진행 중 - 3명 참여</p>
            </div>
            <div className="album-photo-grid">
              {[...Array(10)].map((_, i) => (
              <div key={i} className="photo-placeholder-item"></div>
            ))}
            </div>
            <div className="album-release">
              <p>여행이 끝나면 공개됩니다</p>
              <p className='album-shots'>10/24개 촬영 완료</p>
            </div>
          </div>

        <div className="completed-album">
          <h2 className="section-title">완료된 여행</h2>
          <div className="completed-trips-list">
            {completedTrips.map((trip, index) => (
              <EndedTripItem
                key={index}
                title={trip.title}
                dateRange={trip.dateRange}
                members={trip.members}
                count={trip.count}
                image={trip.image}
              />
            ))}
          </div>          
        </div>

        </div>
    </div>
  )
}

export default Album