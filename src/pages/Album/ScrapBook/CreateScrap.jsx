import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './CreateScrap.css'; 
import PhotoFrame from '../../../components/Album/ScrapBook/PhotoFrame';
import { toPng } from 'html-to-image';
import { useRef } from 'react';

// === 프레임에 따른 사진 위치 정보 (실제 디자인에 맞게 조정 필요) ===
const FRAME_POSITIONS = {
    1: [ // '/frame1.PNG'에 대한 4장의 사진 위치 설정
        { id: 1, initialUrlIndex: 0, style: { top: '0', left: '0', width: '32rem', height: '48rem' } },
        { id: 2, initialUrlIndex: 1, style: { top: '7.2rem', left: '6.2rem', width: '8.7rem', height: '11.6rem', transform: 'rotate(-9.802deg)' } },
        { id: 3, initialUrlIndex: 2, style: { top: '24.4rem', left: '15rem', width: '11.4rem', height: '12.2rem', transform: 'rotate(5.292deg)' } },
        { id: 4, initialUrlIndex: 3, style: { top: '10.5rem', left: '16.7rem', width: '10.8rem', height: '8.9rem'} },
    ]
};

const CreateScrap = () => {
    const location = useLocation();
    const { 
        selectedPics = [], 
        selectedFrameId,
        selectedFrameUrl 
    } = location.state || {};

    const scrapRef = useRef(null);

    // 선택된 프레임의 위치 정보 가져오기
    const initialFrameData = FRAME_POSITIONS[selectedFrameId] || [];

    // 사진을 채워넣기
    const frames = (
        initialFrameData.map(frame => ({
            ...frame,
            url: selectedPics[frame.initialUrlIndex] || null // 선택된 사진 URL을 순서대로 채움
        }))
    );


    //이미지 저장함수
    const handleSaveScrapbook = async () => {
      if (!scrapRef.current) {
        alert("스크랩북 제작 중 오류가 발생했습니다. 다시 시도해주세요.");
        return;
      }
  
      try {
        const dataUrl = await toPng(scrapRef.current, {
          cacheBust: true,
          pixelRatio: 3,
        });
  
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `scrapbook_${new Date().toISOString()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
  
        alert('스크랩북이 저장되었습니다!');
      } catch (error) {
        console.error('스크랩북 저장에 실패했습니다.', error);
        alert('이미지 저장에 실패했습니다.');
      }
    };
  
    //사진 개수 미달시 뒤로가기
    if (!selectedFrameId || selectedPics.length !== 4) {
        return (
            <div className="error-message">
                필수 데이터가 부족합니다. <a href="/">처음으로</a>
            </div>
        );
    }

    return (
        <div className='create-scrap'>
          <Header title={"스크랩북"}/>
          <div className="create-scrap-container">
              <h1>완성된 스크랩북</h1>
              <div className="scrap-img-container" ref={scrapRef}>
                <img src={selectedFrameUrl} alt="" className='frame-img'/>
                {/* 4개의 사진 프레임 렌더링 */}
                {frames.map((frame) => (
                    <PhotoFrame
                        key={frame.id}
                        frameId={frame.id}
                        imageUrl={frame.url}
                        frameStyle={frame.style}
                      />
                ))}
              </div>

              <button className='save-button' onClick={handleSaveScrapbook}>
                스크랩북 저장하기
              </button>
          </div>
          <Navbar/>
        </div>
    );
};

export default CreateScrap;