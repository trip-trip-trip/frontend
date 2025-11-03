import React from 'react';
import './TripDetail.css';
import SharedFriends from '../../components/Album/sharedFriends';
import { useNavigate } from 'react-router-dom';

const sharedList = [
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
  ];

const picList = [
    '/trip-img/trip1.jpeg', '/trip-img/trip3.jpeg', '/trip-img/trip4.jpeg', '/trip-img/trip5.jpeg', '/trip-img/trip6.jpeg', '/trip-img/trip7.jpeg'
];

const TripDetail = () => {
  const navigate = useNavigate();
  return (
    <div className='trip-detail'>
      <div className='trip-detail-container'>
        {/* 공유된 친구 정보 */}
        <SharedFriends data={sharedList} />

        {/* 공유 토글 + 공유하기 뱃지 */}
        <section className='share-row'>
          <div className='share-toggle'>
            <button className='share-toggle-btn'>개인</button>
            <button className='share-toggle-btn active'>공유</button>
          </div>
          <div className="share-button">
            <button className='share-pill'>공유하기</button>
          </div>
        </section>

        {/* 3초영상 섹션 */}
        <section className='section'>
          <div className='section-header'>
            <h2 className='section-title'>3초영상</h2>
            <button className='more-button' onClick={()=>navigate('/trips/detail/vid')}>+ 더보기</button>
          </div>

          <div className='video-grid'>
            <div className='video-card video-main'>

            </div>
            <div className='video-card'></div>
            <div className='video-card'></div>
            <div className='video-card'></div>
            <div className='video-card'></div>
          </div>
        </section>

        {/* 사진 섹션 */}
        <section className='section'>
          <div className='section-header'>
            <h2 className='section-title'>사진</h2>
            <button className='more-button'>+ 더보기</button>
          </div>

          <div className='photo-grid'>
            {picList.map((pics)=>(
                <div className='photo-item'>
                    <img src={pics} alt="" />
                </div>
            ))}
          </div>
        </section>

        {/* 스크랩북 버튼 */}
        <section className='scrapbook-actions'>
          <button className='scrapbook-btn'>
            <h1>완성된<br />스크랩북</h1>
          </button>
          <button className='scrapbook-btn'>
            <h1>스크랩북<br />만들기</h1>
          </button>
        </section>
      </div>
    </div>
  );
};

export default TripDetail;
