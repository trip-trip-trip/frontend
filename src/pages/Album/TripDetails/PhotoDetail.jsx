import React from 'react'
import './PhotoDetail.css'
import Header from '../../../components/Header/Header'
import Navbar from '../../../components/NavBar/NavBar'
import link_icon from '/icons/link_icon.png'
import { useState } from 'react';
import grid_on from '/icons/grid_on.png'
import grid_off from '/icons/grid_off.png'
import slide_on from '/icons/slide_on.png'
import slide_off from '/icons/slide_off.png'
import shared_icon from '/icons/shared_icon.png'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

const PhotoDetail = () => {
  const [checkGrid, SetCheckGrid] = useState('grid');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0); // 현재 슬라이드 인덱스
  const [showShared, setShowShared] = useState(false);
  const handleToggleShared = (e) => {
    setShowShared(e.target.checked);
  };
  const location = useLocation();
  const navigate = useNavigate();
  const {tripId} = useParams();
  const { 
    picList = []
} = location.state || {};
  // 슬라이드 나중에 구현 예정!!


  return (
    <div className='photo-detail'>
      <Header toBack={true}/>
      
        {(checkGrid === 'grid') 
          ? 
          <div className="photo-detail-container grid-mode">
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
                          
            <div className='photo-grid-detail'>
              {picList.map((pics, index)=>(
                <div className='photo-item-detail' key={index}> 
                    <img src={pics.url} alt="" onClick={()=> navigate(`/trips/detail/${tripId}/${pics.mediaAssetId}`, 
                      {state: {
                        url: pics.url,
                        comment: pics.comment,
                        mediaKind: pics.mediaKind
                      }})}/>
                    {showShared && pics.isShared && (
                      <div className='shared-link-icon'>
                        <img src={shared_icon} alt="공유됨" />
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
          : 
          <div className="photo-detail-container slide-mode">
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
            
            {/* 메인 사진 슬라이드 영역 */}
            <div className='main-photo-view'>
              <img 
                src={picList[currentSlideIndex].url} 
                alt="Main Slide" 
                className='current-slide-img' 
              />
            </div>

            <div className="display-shared slide-mode-display">
                <input type="checkbox"
                        className='display-checked'
                        checked={showShared}
                        onChange={handleToggleShared}/>
                <p>공유된 미디어 표시</p>
            </div>
            
            <div className='thumbnail-scroller'>
              {picList.map((pics, index) => (
                <div 
                    key={index} 
                    className={`slide-thumbnail-item ${index === currentSlideIndex ? 'active-thumbnail' : ''}`}
                    onClick={() => setCurrentSlideIndex(index)}
                >
                  <div className='photo-item-detail' key={index}> 
                    <img src={pics.url} alt={`Thumbnail ${index + 1}`} />
                    {showShared && pics.isShared && (
                      <div className='shared-link-icon'>
                        <img src={shared_icon} alt="공유됨" />
                      </div>
                    )}
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

export default PhotoDetail