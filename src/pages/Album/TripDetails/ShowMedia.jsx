import React from 'react'
import './ShowMedia.css'
import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';

const ShowMedia = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [url, setUrl] = useState(location?.state?.url);
    const [comment, setComment] = useState(location?.state?.comment || " ");
    const [mediaKind, setMediaKind] = useState(location?.state?.mediaKind);
    // const handleDownload = () => {
    //     if (!url) {
    //         alert('다운로드할 미디어가 없습니다.');
    //         return;
    //     }

    //     // 1. 가상의 <a> 태그 생성
    //     const link = document.createElement('a');
    //     link.href = url;
        
    //     // 2. 'download' 속성을 설정하여 다운로드 파일명 지정
    //     // 파일명은 'media'와 현재 시간을 조합하여 고유하게 만듭니다.
    //     const filename = `media_${new Date().getTime()}.jpg`; 
    //     link.setAttribute('download', filename);

    //     // 3. <body>에 링크를 추가하고 클릭 이벤트 강제 실행
    //     document.body.appendChild(link);
    //     link.click();
        
    //     document.body.removeChild(link);
    //     alert(`다운로드를 시작합니다: ${filename}`);
    // };


  return (
    <div className='show-media'>
        {/* <Header toBack={true}/> */}
            <div className="show-media-cont">
                <div className="function-cont">
                    <h1 onClick={()=>navigate(-1)}>ⅹ</h1>
                    {/* <h1 onClick={handleDownload}>다운로드</h1> */}
                </div>
                {
                    (mediaKind === 'VIDEO')
                    ? <video src={url} alt="" />
                    : <img src={url} alt="" />
                }
                <div className="comment-cont">
                    <h4>{ (comment === " ") ? '코멘트가 없습니다.' : comment}</h4>
                </div>
            </div>
        {/* <Navbar/> */}
    </div>
          
  )
}

export default ShowMedia