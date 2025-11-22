import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './CreateScrap.css'; 
import PhotoFrame from '../../../components/Album/ScrapBook/PhotoFrame';
import { toPng } from 'html-to-image';
import { useRef } from 'react';
import save_btn from '/icons/save_btn.png'
import { toBlob } from 'html-to-image';
import { useAuth } from '../../../contexts/AuthContext';


// === 프레임에 따른 사진 위치 정보 (실제 디자인에 맞게 조정 필요) ===
const FRAME_POSITIONS = {
    1: [ // '/frame1.PNG'에 대한 4장의 사진 위치 설정
        { id: 1, initialUrlIndex: 0, style: { top: '0', left: '0', width: '32rem', height: '48rem' } },
        { id: 2, initialUrlIndex: 1, style: { top: '7.2rem', left: '6.2rem', width: '8.7rem', height: '11.6rem', transform: 'rotate(-9.802deg)' } },
        { id: 3, initialUrlIndex: 2, style: { top: '24.4rem', left: '15rem', width: '11.4rem', height: '12.2rem', transform: 'rotate(5.292deg)' } },
        { id: 4, initialUrlIndex: 3, style: { top: '10.5rem', left: '16.7rem', width: '10.8rem', height: '8.9rem'} },
    ],
    2: [ // '/frame1.PNG'에 대한 4장의 사진 위치 설정
      { id: 1, initialUrlIndex: 0, style: { top: '7.2rem', left: '6.2rem', width: '8.7rem', height: '11.6rem', transform: 'rotate(-9.802deg)' } },
      { id: 2, initialUrlIndex: 1, style: { top: '24.4rem', left: '15rem', width: '11.4rem', height: '12.2rem', transform: 'rotate(5.292deg)' } },
      { id: 3, initialUrlIndex: 2, style: { top: '10.5rem', left: '16.7rem', width: '10.8rem', height: '8.9rem'} },
    ],
    3:[ // '/frame1.PNG'에 대한 4장의 사진 위치 설정
      { id: 1, initialUrlIndex: 0, style: { top: '0', left: '0', width: '32rem', height: '48rem' } },
      { id: 2, initialUrlIndex: 1, style: { top: '7.2rem', left: '6.2rem', width: '8.7rem', height: '11.6rem', transform: 'rotate(-9.802deg)' } },
    ],
    4:[ // '/frame1.PNG'에 대한 4장의 사진 위치 설정
      { id: 1, initialUrlIndex: 0, style: { top: '0', left: '0', width: '32rem', height: '48rem' } },
      { id: 2, initialUrlIndex: 1, style: { top: '7.2rem', left: '6.2rem', width: '8.7rem', height: '11.6rem', transform: 'rotate(-9.802deg)' } },
      { id: 3, initialUrlIndex: 2, style: { top: '24.4rem', left: '15rem', width: '11.4rem', height: '12.2rem', transform: 'rotate(5.292deg)' } },
      { id: 4, initialUrlIndex: 3, style: { top: '10.5rem', left: '16.7rem', width: '10.8rem', height: '8.9rem'} },
    ]
};

const CreateScrap = () => {
    const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
    const location = useLocation();
    const { 
        selectedPics = [], 
        selectedFrameId,
        selectedFrameUrl 
    } = location.state || {};

    const scrapRef = useRef(null);
    const {token} = useAuth();
    const navigate = useNavigate();

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
    const handleDownloadScrapbook = async () => {
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

    // 💾 앨범에 저장하기 (API 연동) 함수
    const handleSaveToAlbum = async () => {

      if (!scrapRef.current) {
          alert("스크랩북 제작 중 오류가 발생했습니다. 다시 시도해주세요.");
          return;
      }

      try {
          const fileBlob = await toBlob(scrapRef.current, {
              cacheBust: true,
              pixelRatio: 3,
              backgroundColor: 'white'
          });

          if (!fileBlob) {
              alert('이미지 파일 변환에 실패했습니다.');
              return;
          }

          const fd = new FormData();
          // 파일명은 'scrapbook.png', MIME 타입은 'image/png'로 가정합니다.
          fd.append("file", fileBlob, `scrapbook_${Date.now()}.png`); 

          // 'meta' 필드는 JSON을 Blob으로 변환하여 추가합니다.
          const metaData = {
              "media": {
                  "tripId": selectedPics[0].tripId,
                  "mediaKind": "PHOTO", // 스크랩북이므로 PHOTO
                  "captureType": "SCRAPBOOK", // 스크랩북 고유 타입
                  "comment": '' 
              },
              "tripId": selectedPics[0].tripId,
              "title": 'New Scrapbook'
          };
          const metaBlob = new Blob([JSON.stringify(metaData)], { type: "application/json" });
          fd.append("meta", metaBlob);

          // 3. API 요청
          const res = await fetch("/media/upload/scrapbook", {
              method: "POST",
              headers: { 
                  Authorization: `Bearer ${token}`,
              },
              body: fd
          });

          const result = await res.json();

          if (result.isSuccess) {
              alert('스크랩북이 앨범에 성공적으로 저장되었습니다!');
              // navigate('/album'); 
          } else {
              console.error('API 응답 오류:', result);
              alert(`스크랩북 저장에 실패했습니다: ${result.message || '서버 오류'}`);
          }
      } catch (error) {
          console.error('스크랩북 앨범 저장 중 오류 발생:', error);
          alert('스크랩북을 앨범에 저장하는 중 네트워크 오류가 발생했습니다.');
      }
  };

    return (
        <div className='create-scrap'>
          <Header toBack={true}/>
          <div className="create-scrap-container">
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
              <div className="save-scrap">
                <div className="save-scrap-head">
                  <h1>스크랩북을 완성했어요</h1>
                  <button className='save-scrap-btn' onClick={handleDownloadScrapbook}>
                    <img src={save_btn} alt="" />
                  </button>
                </div>
                <p><span>[앨범에 저장하기]</span>를 눌러서 여행 앨범에 스크랩북을 저장할 수 있어요.</p>
                <button className='save-scrap-button album' onClick={handleSaveToAlbum}>
                  앨범에 저장하기
                </button>
                <button className='save-scrap-button retry' onClick={()=>navigate(-2)}>
                  다시 만들기
                </button>
              </div>
          </div>
          <Navbar/>
        </div>
    );
};

export default CreateScrap;