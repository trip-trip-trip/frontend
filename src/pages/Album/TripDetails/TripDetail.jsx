import React from 'react';
import './TripDetail.css';
import SharedFriends from '../../../components/Album/sharedFriends';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import edit_btn from '/icons/edit_btn.png'
import link_icon from '/icons/link_icon.png'
import album_cont from '/album_cont.png'
import album_cont_vid from '/album_cont_vid.png'
import more_btn from '/icons/more_btn.png'
import { useState } from 'react';
import shared_icon from '/icons/shared_icon.png'
import { useAuth } from '../../../contexts/AuthContext';
import { useEffect } from 'react';

const TripDetail = () => {

  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

  const navigate = useNavigate();
  const { token } = useAuth();
  const { tripId } = useParams();

  // 사진 공유 여부 표시(isShared)
  const [showShared, setShowShared] = useState(false);
  // Fetch 해온 여행 기본 정보 저장
  const [tripInfo, setTripInfo] = useState({ 
    tripId: '',
    title: '', 
    startDate: '', 
    endDate: '', 
    members: []
  });
  // Fetch 해온 사진 정보 저장
  const [photoData, setPhotoData] = useState([]);
  // Fetch 해온 영상 정보 저장
  const [vidData, setVidData] = useState();
  // 로딩상태 표시
  const [isLoading, setIsLoading] = useState(true);


  const handleToggleShared = (e) => {
    setShowShared(e.target.checked);
  };

    // const { 
    //     title ='',
    //     startDate = '',
    //     endDate = '',
    //     members = [],
    // } = location.state || {};


  //수업 상세정보
  const fetchTripDetail = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/trips/${tripId}`,
        {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`여행 상세정보 조회 실패: ${response.status}`);
      }
      const data = await response.json();
      const fetchedTripDetail = data.result;

      if (fetchedTripDetail && fetchedTripDetail.trip){
        setTripInfo({
          tripId: fetchedTripDetail.trip.id,
          title: fetchedTripDetail.trip.title,
          startDate: fetchedTripDetail.trip.startDate, 
          endDate: fetchedTripDetail.trip.endDate,  
          members: (fetchedTripDetail.trip.inviteesNameList || []).map((name, index) => ({
              name: name,
              profile: fetchedTripDetail.trip.inviteesProfileImgList[index] || '',
              tag: fetchedTripDetail.trip.inviteesTagList[index] || ''
          })),
        })
      }

    const photoInfo = (fetchedTripDetail?.contents?.photos || []).map( p => ({
      tripId: p.media.tripId,
      comment: p.media.comment || '',
      url: p.media.url || '',
      isShared: p.media.isShared || false,
    }));
    setPhotoData(photoInfo);

    const videoInfo = {
      madeVideo : fetchedTripDetail.contents.reel ? {
        tripId : fetchedTripDetail.contents.reel.media.tripId,
        url : fetchedTripDetail.contents.reel.media.url,
        comment: fetchedTripDetail.contents.reel.media.comment,
        isShared : fetchedTripDetail.contents.reel.media.isShared,
      } : null,
      videoItems : (fetchedTripDetail.contents.reelItems || []).map(item => ({
        tripId : item.media.tripId,
        url : item.media.url,
        comment: item.media.comment,
        isShared : item.media.isShared,
    }))
    };
    setVidData(videoInfo);

    } catch (error) {
      console.error("Error fetching trip data:", error);
    } finally{
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    if (token && tripId) {
      fetchTripDetail();
    }
  }, [token, tripId]); // token 또는 tripId가 변경될 때 다시 호출

  if (isLoading) {
    return (
      <div className='trip-detail'>
        <Header toBack={true}/>
        <div className='trip-detail-container'>
          <h1>여행 정보를 불러오는 중...</h1>
        </div>
        <Navbar/>
      </div>
    );
  }

  return (
    <div className='trip-detail'>
      <Header toBack={true}/>
      <div className='trip-detail-container'>
        <h1>{tripInfo.title}</h1> 
        <div className="date-and-edit">
          <h3>{(tripInfo.startDate || '').split('-').join('.')} - {(tripInfo.endDate || '').split('-').join('.')}</h3>
          <button className='edit-btn'><img src={edit_btn} alt="" /></button>
        </div>

        {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
        <div className="shared-cont">
          <div className="shared-friend">
            <SharedFriends data={tripInfo.members} />
          </div>
          <button className='share-btn'>
            <img src={link_icon} alt="" />
            <p>공유 사진 관리하기</p>
          </button>
        </div>
        <div className="display-shared">
          <input type="checkbox" 
            className='display-checked'
            checked={showShared}
            onChange={handleToggleShared}
          />
          <p>공유된 미디어 표시</p>
        </div>

        {/* 사진 섹션 */}
          <div className="photo_container">
            <img src={album_cont} alt="" className='album-cont-img' />
            <div className='section-photo-header'>
              <h2 className='photo-cont-title'>사진</h2>
              <button className='more-photo-button' onClick={()=>navigate(`/trips/detail/${tripId}/pic`, {state: { picList : photoData } } )}>
                <img src={more_btn} alt="" />
              </button>
            </div>
            <div className="photo-grid-cont">
              <div className='photo-grid'>
                {photoData.map((pics, index)=>(
                  <div className='photo-item' key={index}> 
                      <img src={pics.url} alt="" />
                      {showShared && pics.isShared && (
                        <div className='shared-link-icon'>
                          <img src={shared_icon} alt="공유됨" />
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button className='scrapbook-btn' onClick={()=>navigate('/scrapbook/frame')}>
            <h1>스크랩북 만들기</h1>
          </button>

          {/* video 섹션 */}
          <div className="video_container">
            <img src={album_cont_vid} alt="" className='album-cont-vid' />
            <div className='section-video-header'>
              <h2 className='video-cont-title'>3초 영상</h2>
              <button className='more-video-button' onClick={()=>navigate(`/trips/detail/${tripId}/vid`)}>
                <img src={more_btn} alt="" />
              </button>
            </div>
            <div className="video-grid-cont">
              <div className='video-grid'>
                {/* 메인 영상 */}
                {vidData.madeVideo && (
                    <div className='video-card video-main'>
                        <video src={vidData.madeVideo.url} controls></video>
                    </div>
                )}
                {/* 릴 아이템들 */}
                {vidData.videoItems && vidData.videoItems.slice(0, 4).map((video, index) => ( // 4개만 표시
                    <div className='video-card' key={index}>
                        <video src={video.url} controls></video>
                    </div>
                ))}
              </div>
            </div>
          </div>
      </div>
      <Navbar/>
    </div>
  );
};

export default TripDetail;

// const sharedList = [
//     { name: '김멋사',
//       profile: '/profile-img.png'},
//     {
//       name: '김친구',
//       profile: '/profile-img.png'
//     },
//     {
//       name: '이친구',
//       profile: '/profile-img.png'
//     },
//   ];

// const picList = [
//   {url: '/trip-img/trip1.jpeg', isShared: true},
//   {url: '/trip-img/trip2.jpeg', isShared: false},
//   {url: '/trip-img/trip3.jpeg', isShared: true},
//   {url: '/trip-img/trip4.jpeg', isShared: false},
//   {url: '/trip-img/trip5.jpeg', isShared: false},
//   {url: '/trip-img/trip6.jpeg', isShared: true},
//   {url: '/trip-img/trip7.jpeg', isShared: false},
// ];

// const videoList = [
//   '/sample_video.MOV',
//   'sample_video.MOV',
//   'sample_video.MOV',
//   'sample_video.MOV',
// ];