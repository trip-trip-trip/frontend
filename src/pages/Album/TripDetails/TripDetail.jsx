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
import { useEffect, useMemo } from 'react';
import default_profile from '/profile-img.png';
import accept_icon from '/icons/accept.png';
import reject_icon from '/icons/reject.png';

const TripDetail = () => {

  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';

  const navigate = useNavigate();
  const { token } = useAuth();
  const params = useParams();
  const location = useLocation();
  const todayDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  const tripId = params.tripId || location.state?.tripId;
  const [isInvited, setIsInvited] = useState(location.state?.invite || false);
  const [currentTripStatus, setCurrentTripStatus] = useState(location.state?.tripState || 'active');
  const [invitationID, setInvitationId] = useState(location.state?.invitationId || '');
  const [inviteInfo, setInviteInfo] = useState([]);
  // 사진 공유 여부 표시(isShared)
  const [showShared, setShowShared] = useState(false);
  const [reelState, setReelState] = useState();
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
  const [scrapData, setScrapData] = useState([]);
  
  // 로딩상태 표시
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // 초대 정보 표시
  const [sentInvitations, setSentInvitations] = useState([]);

  const handleToggleShared = (e) => {
    setShowShared(e.target.checked);
  };

    // const { 
    //     title ='',
    //     startDate = '',
    //     endDate = '',
    //     members = [],
    // } = location.state || {};


  //여행 상세정보
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
        const tripEndDate = fetchedTripDetail.trip.endDate;
        const tripStartDate = fetchedTripDetail.trip.startDate;

        setTripInfo({
          tripId: fetchedTripDetail.trip.id,
          title: fetchedTripDetail.trip.title,
          startDate: fetchedTripDetail.trip.startDate, 
          endDate: fetchedTripDetail.trip.endDate,  
          members: (fetchedTripDetail.trip.inviteesNameList || []).map((name, index) => ({
            name: name,
            profile: fetchedTripDetail.trip.inviteesProfileImgList[index] || 'none',
            tag: fetchedTripDetail.trip.inviteesTagList[index] || ''
        })),
        })

          if (tripEndDate < todayDate) {
            setCurrentTripStatus('completed');
        } else if (tripStartDate <= todayDate && todayDate <= tripEndDate) {
            // 종료일이 오늘이거나 미래면 'active'
            setCurrentTripStatus('active');
        } else{
          setCurrentTripStatus('upcoming');
        }
      }

    const photoInfo = (fetchedTripDetail?.contents?.photos || []).map( p => ({
      tripId: p.media.tripId,
      mediaAssetId: p.media.mediaAssetId,
      contentType: p.media.contentType,
      mediaKind: p.media.mediaKind,
      comment: p.media.comment || '',
      url: p.media.url || '',
      isShared: p.media.isShared || false,
    }));
    setPhotoData(photoInfo);

    const scrapInfo = (fetchedTripDetail?.contents?.scrapbooks || []).map( s => ({
      tripId: s.media.tripId,
      mediaAssetId: s.media.mediaAssetId,
      contentType: s.media.contentType,
      mediaKind: s.media.mediaKind,
      comment: s.media.comment || '',
      url: s.media.url || '',
      isShared: s.media.isShared || false,
    }));
    setScrapData(scrapInfo);
    // console.log(scrapInfo);

    const videoInfo = {
      madeVideo : fetchedTripDetail.contents.reel?.media? {
        tripId : fetchedTripDetail.contents.reel.media.tripId,
        mediaAssetId: fetchedTripDetail.contents.reel.media.mediaAssetId,
        contentType: fetchedTripDetail.contents.reel.media.contentType,
        mediaKind: fetchedTripDetail.contents.reel.media.mediaKind,
        url : fetchedTripDetail.contents.reel.media.url,
        comment: fetchedTripDetail.contents.reel.media.comment,
        isShared : fetchedTripDetail.contents.reel.media.isShared,
      } : null,
      videoItems : (fetchedTripDetail.contents.reelItems || []).map(item => ({
        tripId : item.media.tripId,
        mediaAssetId: item.media.mediaAssetId,
        contentType: item.media.contentType,
        mediaKind: item.media.mediaKind,
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
// 릴스 생성
  const fetchReels = async() => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/trips/${tripId}/reel`,
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
      setReelState(data.result.status);
    } catch (error) {
      console.error("Error fetching trip data:", error);
    } finally{
      setIsLoading(false);
    }
  }

  //여행 초대 정보
  const fetchTripInvite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE}/trips/${tripId}/invite`,
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
      const fetchedInvitation = data.result;
      const currentInvitations = [];

      if (fetchedInvitation.invitations.length > 0){
        fetchedInvitation.invitations.forEach((i)=>{
          if (i.status==="PENDING"){
            currentInvitations.push(i)
          }
        })
      }

      setSentInvitations(currentInvitations);

      if (currentInvitations.length > 0){
        setIsPending(true);
        setInviteInfo(fetchedInvitation.invitations);
      }

    } catch (error) {
      console.error("Error fetching invitation data:", error);
    } finally{
      setIsLoading(false);
    }
  };
  
  const handleRejectRequest = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/invitations/${invitationID}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User-Id": "long"
          },
          body: JSON.stringify({
            "decision": "REJECT"
          }
          )
        }
      );

      if (!response.ok) {
        throw new Error(`초대 거절 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('초대 거절 성공:', data.result);

      alert('여행 초대를 거절했습니다.');
      navigate(`/trips`); 
    } catch (error) {
      console.error("Error editing trip data:", error);
      alert('초대 거절 실패 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleAcceptRequest = async () => {
    try {
      const response = await fetch(
        `${API_BASE}/invitations/${invitationID}`,
        {
          method: "PATCH",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User-Id": "long"
          },
          body: JSON.stringify({
            "decision": "ACCEPT"
          }
          )
        }
      );

      if (!response.ok) {
        throw new Error(`초대 수락 실패: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('초대 수락 성공:', data.result);

      alert('여행 초대를 수락했습니다.');
      navigate(`/trips`); 
    } catch (error) {
      console.error("Error editing trip data:", error);
      alert('초대 수락 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };
  

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    if (token && tripId) {
      fetchTripDetail();
      if (!isInvited){
        fetchTripInvite();
        fetchReels();
      }
    }
  }, [token, tripId]); // token 또는 tripId가 변경될 때 다시 호출

  const handleInvite = () => {
    navigate(`/trips/detail/${tripId}/addFriends`); 
  }

  if (isLoading) {
    return (
      <div className='trip-detail'>
        <Header toBack={true}/>
        <div className='trip-detail-container'>
          <div className='ment'>여행 정보를 불러오는 중...</div>
        </div>
        <Navbar/>
      </div>
    );
  }


  if (isInvited){
    return(
      <div className='trip-detail'>
        <Header toBack={true}/>
          <div className="invitation-cont">
            <p>여행에 초대되었어요</p>
            <div className="invitation-btns">
              <button className='ivitation-btn reject' onClick={handleRejectRequest}>
                <img src={reject_icon} alt="" className='reject-icon'/>
                <h6>거절</h6>
              </button>
              <button className='ivitation-btn accept' onClick={handleAcceptRequest}>
                <img src={accept_icon} alt="" className='accept-icon'/>
                <h6>수락</h6>
              </button>
            </div>
          </div>
        <div className='trip-detail-container'>
          <h1>{tripInfo.title}</h1> 
          <div className="date-and-edit">
            <h3>{(tripInfo.startDate || '').split('-').join('.')} - {(tripInfo.endDate || '').split('-').join('.')}</h3>
            <button className='edit-btn' onClick={()=>navigate(`/trips/detail/${tripId}/edit`)}><img src={edit_btn} alt="" /></button>
          </div>
          {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
          <div className="shared-cont">
            <div className="shared-friend">
              <SharedFriends data={tripInfo.members}/>
            </div>
          </div>
          <div className='ment'>사진은 여행이 끝난 후 확인할 수 있어요</div>
        </div>
        <Navbar/>
      </div>
    )
  } else if (currentTripStatus === 'completed') {
    return (
      <div className='trip-detail'>
        <Header toBack={true}/>
        <div className='trip-detail-container'>
          <h1>{tripInfo.title}</h1> 
          <div className="date-and-edit">
            <h3>{(tripInfo.startDate || '').split('-').join('.')} - {(tripInfo.endDate || '').split('-').join('.')}</h3>
            <button className='edit-btn' onClick={()=>navigate(`/trips/detail/${tripId}/edit`)}><img src={edit_btn} alt="" /></button>
          </div>
  
          {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
          <div className="shared-cont">
            <div className="shared-friend">
              <SharedFriends data={tripInfo.members} />
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
                  {photoData.slice(0,8).map((pics, index)=>(
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
  
            <button className='scrapbook-btn' onClick={()=>navigate('/scrapbook/frame', {state: { tripId: tripInfo.tripId } } )}>
              <h1>스크랩북 만들기</h1>
            </button>
  
            {/* video 섹션 */}
            <div className="video_container">
              <img src={album_cont_vid} alt="" className='album-cont-vid' />
              <div className="section-video-wrap">
                <div className='section-video-header'>
                  <h2 className='video-cont-title'>3초 영상</h2>
                  <button className='more-video-button' onClick={()=>navigate(`/trips/detail/${tripId}/vid`, {state: { vidData : vidData } })}>
                    <img src={more_btn} alt="" />
                  </button>
                </div>
                <div className="video-grid-cont">
                  <div className='video-grid'>
                    {/* 메인 영상 */}
                    {vidData?.madeVideo && (
                        <div className='video-card video-main'>
                          {showShared && vidData?.madeVideo.isShared && (
                            <div className='shared-link-icon mainvideo'>
                              <img src={shared_icon} alt="공유됨" />
                            </div>
                          )}
                            <video src={vidData.madeVideo.url} controls/>
                        </div>
                    )}
                    {/* 릴 아이템들 */}
                    {vidData?.videoItems && vidData.videoItems.slice(0, 4).map((video, index) => ( // 4개만 표시
                        <div className='video-card' key={index}>
                          {showShared && video.isShared && (
                            <div className='shared-link-icon video'>
                              <img src={shared_icon} alt="공유됨" />
                            </div>
                          )}
                            <video src={video.url} controls />
                            
                        </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
  
            {/* 스크랩북 섹션 */}
            {
              (scrapData.length > 0) &&
              <div className="photo_container scrapbook">
                <img src={album_cont} alt="" className='album-cont-img scrapbook' />
                <div className='section-photo-header scrapbook'>
                  <h2 className='photo-cont-title scrapbook'>스크랩북</h2>
                  <button className='more-photo-button' onClick={()=>navigate(`/trips/detail/${tripId}/pic`, {state: { picList : scrapData } } )}>
                    <img src={more_btn} alt="" />
                  </button>
                </div>
                <div className="photo-grid-cont">
                  <div className='photo-grid'>
                    {scrapData.map((pics, index)=>(
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
            }
            
        </div>
        <Navbar/>
      </div>
    );
  } else if ( currentTripStatus === 'active'){
    return (
      <div className='trip-detail'>
        <Header toBack={true}/>
        <div className='trip-detail-container'>
          <h1>{tripInfo.title}</h1> 
          <div className="date-and-edit">
            <h3>{(tripInfo.startDate || '').split('-').join('.')} - {(tripInfo.endDate || '').split('-').join('.')}</h3>
            <button className='edit-btn' onClick={()=>navigate(`/trips/detail/${tripId}/edit`)}><img src={edit_btn} alt="" /></button>
          </div>
  
          {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
          <div className="shared-cont">
            <div className="shared-friend">
              <SharedFriends data={tripInfo.members} invite={true} onInviteClick={handleInvite} />
            </div>
            {isPending &&
            <div className="pending-cont">
              {sentInvitations.map((i, index)=>(
                <img key={index} src={i.inviteeAvatarUrl || default_profile} alt="" className='pending-profile'/>
              ))}
              <div className="pending-shared" onClick={()=>navigate(`/trips/detail/${tripId}/invitedFriends`, 
                {state : {sentInvitations: sentInvitations,
                          startDate: tripInfo.startDate,
                          endDate: tripInfo.endDate,
                          name: tripInfo.title
                }})}>
                {sentInvitations.length}명 수락 대기 중 {'>'}
              </div>
            </div>
            
            }
          </div>
          <div className='ment'>사진은 여행이 끝난 후 확인할 수 있어요</div>
        </div>
        <Navbar/>
      </div>
    );
  } else {
    return(
      <div className='trip-detail'>
        <Header toBack={true}/>
        <div className='trip-detail-container'>
          <h1>{tripInfo.title}</h1> 
          <div className="date-and-edit">
            <h3>{(tripInfo.startDate || '').split('-').join('.')} - {(tripInfo.endDate || '').split('-').join('.')}</h3>
            <button className='edit-btn' onClick={()=>navigate(`/trips/detail/${tripId}/edit`)}><img src={edit_btn} alt="" /></button>
          </div>


          {/* 공유된 친구 정보 & 공유 사진 관리 버튼*/}
          <div className="shared-cont">
            <div className="shared-friend">
              <SharedFriends data={tripInfo.members} invite={true} onInviteClick={handleInvite} />
            </div>
            {isPending &&
            <div className="pending-cont">
              {sentInvitations.map((i, index)=>(
                <img key={index} src={i.inviteeAvatarUrl || default_profile} alt="" className='pending-profile'/>
              ))}
              <div className="pending-shared" onClick={()=>navigate(`/trips/detail/${tripId}/invitedFriends`, 
                {state : {sentInvitations: sentInvitations,
                          startDate: tripInfo.startDate,
                          endDate: tripInfo.endDate,
                          name: tripInfo.title
                }})}>
                {sentInvitations.length}명 수락 대기 중 {'>'}
              </div>
            </div>
            }
          </div>
          <div className='ment'>아직 여행이 시작되지 않았어요</div>
        </div>
        <Navbar/>
      </div>
    )
  }
};

export default TripDetail;
