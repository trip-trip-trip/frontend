import React from 'react'
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './PickFrame.css'
import { useLocation, useNavigate } from 'react-router-dom';

// 프레임 목록 더미
const FrameList = [
  { id: 1, url: '/frame1.PNG', picNum: 4 },
  { id: 2, url: '/frame1.PNG', picNum: 4 },
  { id: 3, url: '/frame1.PNG', picNum: 4 },
  { id: 4, url: '/frame1.PNG', picNum: 4 },
];
const PickFrame = () => {
  const navigate = useNavigate();

  const location = useLocation();
  const picList = location.state?.picList;

  // 프레임 선택 핸들러
  const handleFrameSelect = (frameId, picNum, frameUrl) => {
    // 사진 선택 페이지로 이동하면서 선택된 프레임 정보를 state로 전달
    navigate('/scrapbook/create', {
        state: {
            selectedPicNum: picNum,  
            selectedFrameUrl: frameUrl,
            selectedFrameId: frameId,
            picList: picList
        }
    });
  };

  return (
    <div className='pick-frame'>
        <Header toBack={true}/>
      <div className="frame-container">
        <div className="select-frame-title">
            <p>스크랩북 템플릿을 고르세요</p>
        </div>
        <div className='frame-grid'>
          {FrameList.map((frame)=>(
            <div 
                key={frame.id}
                className='frame-item'
                onClick={() => handleFrameSelect(frame.id, frame.picNum, frame.url)} // 수정된 핸들러 호출
            >
                <img src={frame.url} alt="" />
            </div>
          ))}
        </div>
      </div>
      <Navbar/>
    </div>
  )
}

export default PickFrame