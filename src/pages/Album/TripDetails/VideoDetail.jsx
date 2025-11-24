import React from 'react'
import './VideoDetail.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import link_icon from '/icons/link_icon.png'
import { useState, useMemo } from 'react'; // useMemo 추가
import grid_on from '/icons/grid_on.png'
import grid_off from '/icons/grid_off.png'
import slide_on from '/icons/slide_on.png'
import slide_off from '/icons/slide_off.png'
import shared_icon from '/icons/shared_icon.png'
import { useLocation, useNavigate, useParams } from 'react-router-dom'  

const VideoDetail = () => {
  const [checkGrid, SetCheckGrid] = useState('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); 
  const [showShared, setShowShared] = useState(false);
  const handleToggleShared = (e) => {
    setShowShared(e.target.checked);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const {tripId} = useParams();
  const { 
    vidData = { madeVideo: null, videoItems: [] } // vidData의 기본값 구조 명시
} = location.state || {};

  // ✅ madeVideo와 videoItems를 결합하여 단일 배열(fullVideoList) 생성
  const fullVideoList = useMemo(() => {
    const list = [];
    if (vidData.madeVideo) {
      list.push(vidData.madeVideo); // 메인 영상을 첫 번째 요소로 추가
    }
    list.push(...(vidData.videoItems || [])); // 릴 아이템 추가
    return list;
  }, [vidData]);
  
  // 현재 슬라이드/메인 비디오 정보
  const currentVideo = fullVideoList[currentSlideIndex];

  return (
    <div className='video-detail'>
      <Header toBack={true}/>
      
      {(checkGrid === 'grid') 
        ? 
        <div className="video-detail-container grid-mode">
          <div className="shared-cont"> 
            <div className="choose-grid">
              <img src={grid_on} alt="" /> <img src={slide_off} alt="" onClick={()=>SetCheckGrid('slide')}/>
            </div>
            <button className='share-btn' onClick={() => navigate(`/trips/detail/${tripId}/share`)}>
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
                        
          <div className="video_container">
            <div className="section-video-wrap">
              <div className="video-grid-cont">
                <div className='video-grid'>
                  {/* ✅ 메인 영상 (madeVideo) 렌더링 */}
                  {vidData?.madeVideo && (
                      <div 
                          className='video-card video-main' 
                          onClick={() => { // 슬라이드 모드 전환 시 메인 영상 인덱스로 설정
                              SetCheckGrid('slide');
                              setCurrentSlideIndex(0);
                          }}
                      >
                        {showShared && vidData.madeVideo.isShared && (
                          <div className='shared-link-icon mainvideo'>
                            <img src={shared_icon} alt="공유됨" />
                          </div>
                        )}
                          <video src={vidData.madeVideo.url} controls onClick={()=> navigate(`/trips/detail/${tripId}/${vidData.madeVideo.mediaAssetId}`, 
                          {state: {
                            url: vidData.madeVideo.url,
                            comment: vidData.madeVideo.comment,
                            mediaKind: vidData.madeVideo.mediaKind
                          }})}/>
                      </div>
                  )}
                  {/* ✅ 릴 아이템들 렌더링 */}
                  {vidData?.videoItems && vidData.videoItems.map((video, index) => ( 
                      <div 
                          className='video-card' 
                          key={index}
                          onClick={() => { // 슬라이드 모드 전환 시 해당 릴 아이템 인덱스로 설정
                              SetCheckGrid('slide');
                              // madeVideo가 있다면 인덱스에 1을 더해줘야 정확한 위치가 됨
                              const offset = vidData.madeVideo ? 1 : 0; 
                              setCurrentSlideIndex(index + offset);
                          }}
                      >
                        {showShared && video.isShared && (
                          <div className='shared-link-icon video'>
                            <img src={shared_icon} alt="공유됨" />
                          </div>
                        )}
                          <video src={video.url} controls onClick={()=> navigate(`/trips/detail/${tripId}/${video.mediaAssetId}`, 
                          {state: {
                            url: video.url,
                            comment: video.comment,
                            mediaKind: video.mediaKind
                          }})}/>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        : 
        <div className="video-detail-container slide-mode">
          <div className="top-controls slide-mode"> 
            <div className="choose-grid slide-mode">
              <img src={grid_off} alt="Grid View" onClick={()=>SetCheckGrid('grid')}/> 
              <img src={slide_on} alt="Slide View" />
            </div>
            <button className='share-btn'>
              <img src={link_icon} alt="" />
              <p>공유 사진 관리하기</p>
            </button>
          </div>
          
          <div className='main-video-view'>
            {currentVideo && (
                <video 
                    src={currentVideo.url} 
                    alt="Current Video" 
                    className='current-slide-img' 
                    controls // 슬라이드 뷰에서는 컨트롤이 있는 것이 일반적
                />
            )}
          </div>

          <div className="display-shared slide-mode-display">
              <input type="checkbox"
                      className='display-checked'
                      checked={showShared}
                      onChange={handleToggleShared}/>
              <p>공유된 미디어 표시</p>
          </div>
          
          <div className='thumbnail-scroller'>
            {fullVideoList.map((video, index) => (
              <div 
                  key={index} 
                  className={`slide-thumbnail-item ${index === currentSlideIndex ? 'active-thumbnail' : ''}`}
                  onClick={() => setCurrentSlideIndex(index)}
              >
                <div className='video-item-detail' key={index}> 
                  {showShared && video.isShared && (
                    <div className='shared-link-icon mini-video'>
                      <img src={shared_icon} alt="공유됨" />
                    </div>
                  )}
                  <video 
                      src={video.url} 
                      alt={`Thumbnail ${index + 1}`} 
                      preload='metadata'
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      }
        
    <Navbar/>
    </div>
  )
}

export default VideoDetail