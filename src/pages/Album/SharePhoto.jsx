import React from 'react'
import './SharePhoto.css'
import { useState } from 'react';
import shared_icon from '/icons/shared_icon.png'
import Header from '../../components/Header/Header';
import Navbar from '../../components/NavBar/NavBar';
import { useNavigate } from 'react-router-dom';

const picList = [
  '/trip-img/trip1.jpeg', '/trip-img/trip3.jpeg', '/trip-img/trip4.jpeg', '/trip-img/trip5.jpeg', '/trip-img/trip6.jpeg', '/trip-img/trip7.jpeg', '/trip-img/trip8.jpeg', '/trip-img/trip9.jpeg', '/trip-img/trip10.jpeg', '/trip-img/trip11.jpeg'
];

const SharePhoto = () => {
    const [showShared, setShowShared] = useState(false);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [selectedPics, setSelectedPics] = useState([]);
    const navigate = useNavigate();

    // 이미지 선택/선택 해제
    const handleSelectShare = (picUrl) => {
        // 이미 선택된건지 확인
        const isSelected = selectedPics.includes(picUrl);
  
        if (isSelected) {
            setSelectedPics(prev => prev.filter(url => url !== picUrl)); // 선택해제
            setShowShared(false)
        } else {
            setSelectedPics(prev => [...prev, picUrl]);
            setShowShared(true);
        }
      };

    const handleSelectAll = (picList) => {
        if (!isAllSelected){
            setSelectedPics(picList);
            setIsAllSelected(true);
        } else{
            setSelectedPics([]);
            setIsAllSelected(false);
        }
    }

  return (
    <div className='share-photo'>
        <Header toBack={true} />
        <div className="share-photo-cont">
            <h1>여행 멤버들에게 사진을 공유해요</h1>
            <h3>멤버들은 공유된 사진으로 릴스, 스크랩북을 만들고 게시물을 올릴 수 있어요. 여행의 추억을 함께 간직해요!</h3>
            <div className="share-all">
                <input type="checkbox" onClick={()=>handleSelectAll(picList)}/>
                <h2>전체 선택</h2>
            </div>
            <div className='photo-grid-detail'>
            {picList.map((picUrl, index) => {
                  const isSelected = selectedPics.includes(picUrl);
                  return (
                    <div 
                        key={index} 
                        className={`photo-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectShare(picUrl)}
                    >
                      <img src={picUrl} alt={`여행 사진 ${index + 1}`} />
                      {
                        // 선택했을 때
                        isSelected && (
                          <div className="share-selected-overlay">
                            <div className='shared-link-icon'>
                                <img src={shared_icon} alt="공유됨" />
                                </div>
                          </div>
                        )
                      }
                    </div>
                  );
                })}
            </div>
            {
                selectedPics.length > 0 &&
                <button className='share-media-btn' onClick={()=>navigate('/trips/detail')}>공유하기</button>
            }
        </div>
        <Navbar/>
    </div>
  )
}

export default SharePhoto