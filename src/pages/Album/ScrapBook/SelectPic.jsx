import React, { useState } from 'react'; // useState import
import './SelectPic.css';
import SharedFriends from '../../../components/Album/sharedFriends';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import { useLocation, useNavigate } from 'react-router-dom';

const sharedList = [
    { name: '김멋사', profile: '/profile-img.png' },
    { name: '김친구', profile: '/profile-img.png' },
    { name: '이친구', profile: '/profile-img.png' },
];

const picList = [
    '/trip-img/trip1.jpeg', '/trip-img/trip3.jpeg', '/trip-img/trip4.jpeg', '/trip-img/trip5.jpeg', 
    '/trip-img/trip6.jpeg', '/trip-img/trip7.jpeg', '/trip-img/trip8.jpeg', '/trip-img/trip9.jpeg', 
    '/trip-img/trip10.jpeg', '/trip-img/trip11.jpeg'
];

const SelectPic = () => {
    const [selectedPics, setSelectedPics] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const selectedPicNum = location.state?.selectedPicNum;
    const selectedFrameUrl = location.state?.selectedFrameUrl;
    const selectedFrameId = location.state?.selectedFrameId;

    if (!selectedPicNum || !selectedFrameUrl || !selectedFrameId) {
      console.log(selectedPicNum, selectedFrameUrl, selectedFrameId)
      // alert('선택된 프레임 정보가 없습니다. 프레임 선택 페이지로 돌아갑니다.');
  }

    // 이미지 선택/선택 해제
    const handleSelectPic = (picUrl) => {
      // 이미 선택된건지 확인
      const isSelected = selectedPics.includes(picUrl);

      if (isSelected) {
          // 선택 해제
          setSelectedPics(prev => prev.filter(url => url !== picUrl));
      } else {
          // 선택 추가: 4장 미만일 때만 추가
          if (selectedPics.length < selectedPicNum) {
              setSelectedPics(prev => [...prev, picUrl]);
          } else {
              alert(`최대 ${selectedPicNum}장까지만 선택할 수 있습니다!`);
          }
      }
    };

    return (
        <div className='select-pic'>
          <Header toBack={true}/> 
          
          <div className="photo-pick-container">
              <img src={selectedFrameUrl} alt="" className='frame-preview'/>
              <div className="select-pic-title">
                  <h1>스크랩북에 넣을 사진을 고르세요</h1>
                  <p>총 {selectedPicNum}장의 사진을 골라주세요!</p>
                  <h3>템플릿의 분위기와 어울리는 사진을 고르면 멋진 스크랩북을 만들 수 있어요.</h3>
              </div>
              <div className="next-btn-container">
                <button 
                  className={`next-button ${selectedPics.length === selectedPicNum ? 'active' : ''}`}
                  disabled={selectedPics.length !== selectedPicNum}
                  onClick={() => {
                      if (selectedPics.length === selectedPicNum) {
                          // 최종 스크랩북 생성 페이지로 이동
                          navigate('/scrapbook/complete', { 
                              state: { 
                                  selectedPics: selectedPics,
                                  selectedFrameId: selectedFrameId || 1, 
                                  selectedPicNum: selectedPicNum || 4, // 프레임 ID가 없을 경우 임시 값 사용
                                  selectedFrameUrl: selectedFrameUrl || '/frame1.PNG' // 프레임 URL이 없을 경우 임시 값 사용
                              } 
                          });
                      }
                  }}
              >
                  {(selectedPics.length === selectedPicNum) ? 
                    '스크랩북 만들기!':`${selectedPicNum}장의 사진을 골라주세요 (${selectedPics.length}/${selectedPicNum})`}
              </button>
              </div>

              <div className='photo-grid'>
                {picList.map((picUrl, index) => {
                  const isSelected = selectedPics.includes(picUrl);
                  return (
                    <div 
                        key={index} 
                        className={`photo-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelectPic(picUrl)}
                    >
                      <img src={picUrl} alt={`여행 사진 ${index + 1}`} />
                      {
                        // 선택했을 때
                        isSelected && (
                          <div className="selection-overlay">
                              <span className="check-icon">✓</span>
                          </div>
                        )
                      }
                    </div>
                  );
                })}
              </div>
          
              
          </div>
          <Navbar/>
        </div>
    );
}

export default SelectPic;