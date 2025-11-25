import React from 'react'
import './SharedList.css'
import { useState, useEffect } from 'react'; // 💡 useEffect import 추가
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import edit_btn from '/icons/edit_btn.png'
import wait_icon from '/icons/request_wait.png'
import shared_icon from '/icons/shared_list.png'
import cancel_btn from '/icons/cancel_btn.png'
import dropdown_icon from '/icons/dropdown_icon.png'
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import default_profile from '/profile-img.png';
import { useAuth } from '../../../contexts/AuthContext';

const DropdownIcon = ({ isOpen }) => (
    <span className={`dropdown-icon ${isOpen ? 'open' : ''}`}>{isOpen ? <img src={dropdown_icon} className='dropdown open' alt="닫기"/> : <img src={dropdown_icon} className='dropdown closed' alt="열기"/>}</span>
);

const SharedList = () => {
  const API_BASE = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_BASE_URL || 'https://tripshot.duckdns.org') 
    : '/api';
  // const API_BASE = 'https://tripshot.duckdns.org';
  // const token = 'eyJhbGciOiJIUzUxMiJ9.eyJsdmwiOiJBQ0NFU1MiLCJzdWIiOiIzNCIsImlhdCI6MTc2NDAxNjU3MiwiZXhwIjoxNzY0MDIwMTcyfQ._4xjrwuzZCFw3X2t6KZyKr9P4UP1AtdH9YCSJHOvyJZomUh4E4KYho7M3gxSoQ-te7DtbsWvSmDR_AQwmFTSNw';

    const [isPendingOpen, setIsPendingOpen] = useState(true);
    const [isMembersOpen, setIsMembersOpen] = useState(true);
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(true);
    const { tripId } = useParams();
    const navigate = useNavigate();
    const {token} = useAuth();

    const invitationData = location.state?.inviteInfo || [];
    const tripName = location.state?.name || '';
    const startDate = location.state?.startDate || '';
    const endDate = location.state?.endDate || '';

    const [confirmedMembers, setConfirmedMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);

    console.log(pendingInvitations);

    const fetchInvitation = async() => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `${API_BASE}/trips/${tripId}/invite`,
          {
            method: "GET",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-User-Id": "long"
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`여행 상세정보 조회 실패: ${response.status}`);
        }
        const data = await response.json();
        const invitationData = data.result.invitations;

        const pendingList = [];
        const confirmedList = [];
        
        invitationData.forEach((i) => {
          if (i.status === "PENDING"){
            pendingList.push(i);
          } else if (i.status === "ACCEPTED") {
            confirmedList.push(i)
          }

          setConfirmedMembers(confirmedList);
          setPendingInvitations(pendingList);
        });

      } catch (error) {
        console.error("Error fetching trip data:", error);
      } finally{
        setIsLoading(false);
      }
    }

    const handleDeleteInvitation = async(data) => {
      setIsLoading(true);
      const invitationId = data;
      try {
        const response = await fetch(
          `${API_BASE}/invitations/${invitationId}`,
          {
            method: "DELETE",
            headers: {
              "Content-type": "application/json",
              Authorization: `Bearer ${token}`,
              "X-User-Id": "long"
            },
          }
        );
  
        if (!response.ok) {
          throw new Error(`여행 상세정보 조회 실패: ${response.status}`);
        }
        const data = await response.json();

        alert("초대가 삭제되었습니다.");
        navigate(`/trips/detail/${tripId}/invitedFriends`, 
          {state : {startDate: startDate,
                    endDate: endDate,
                    name: tripName
          }})
        fetchInvitation

      } catch (error) {
        console.error("Error deleting invitation:", error);
      } finally{
        setIsLoading(false);
      }
    }
    
    useEffect(() => {
        if (token && tripId) {
          fetchInvitation();
        }
      }, [token, tripId]);
        
    const handleEditClick = () => {
      navigate(`/trips/detail/${tripId}/edit`);
    };

    if (isLoading) {
      return (
        <div className='album'>
          <Header/>
            <div className="album-container">
              <div className="ment">공유된 미디어를 불러오는 중...</div>
            </div>
          <Navbar/>
        </div>
      );
    }

    return (
      <div className='shared-list'>
          <Header toBack={true} />
          <div className="shared-list-container">
            {/* 여행정보 */}
            <div className='shared-detail-container'>
              <div className="shared-info-section">
                <h1>{tripName}</h1> 
                <div className="date-edit-section">
                  <div className="date-range">
                    <h3>{(startDate || '').split('-').join('.')} - {(endDate || '').split('-').join('.')} </h3>
                  </div>
                  <button className='edit-icon-btn' onClick={handleEditClick}><img src={edit_btn} alt="수정 버튼" /></button>
                </div>
              </div>
              <div className="dotted-line"></div>
            </div>

            {/* 초대 수락 대기 중 */}
            <div className="section-block">
              <div className="section-header" onClick={() => setIsPendingOpen(!isPendingOpen)}>
                <div className="header-title-wrapper">
                  <img src={wait_icon} alt="대기 아이콘" />
                  <h3 className="section-title">초대 수락 대기중</h3>
                </div>
                <DropdownIcon isOpen={isPendingOpen} />
              </div>
                
              {isPendingOpen && (
                <div className="member-list pending-list">
                  {pendingInvitations.map((invitee) => (
                    <div className="member-row" key={invitee.invitationId}>
                      <div className="profile-info">
                        {(invitee.inviteeAvatarUrl)
                          ?
                          <img src={invitee.inviteeAvatarUrl} alt="" className='profile-img'/>
                          :
                          <img src={default_profile} alt="" className='profile-img'/>  }

                          <div className="name-tag-wrapper">
                            <p className="member-name">{invitee.inviteeUsername}</p>
                            <p className="member-tag">#{invitee.inviteeTag}</p>
                          </div>
                      </div>
                      <div className="status-actions">
                        <span className="status-badge pending">대기중</span>
                        <img src={cancel_btn} alt="" className='cancel-btn' onClick={()=>handleDeleteInvitation(invitee.invitationId)}/>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* 일행 목록 */}
            <div className="section-block">
              <div className="section-header" onClick={() => setIsMembersOpen(!isMembersOpen)}>
                <div className="header-title-wrapper">
                  <img src={shared_icon} alt="일행 아이콘" />
                  <h3 className="section-title">일행 목록</h3>
                </div>
                <DropdownIcon isOpen={isMembersOpen} />
              </div>
                
              {isMembersOpen && (
                <div className="member-list confirmed-list">
                  {confirmedMembers.map((member) => (
                    <div className="member-row" key={member.invitationId}> {/* 🔑 Key는 invitationId 사용 */}
                      <div className="profile-info">
                        <div className="profile-circle"></div>
                        <div className="name-tag-wrapper">
                          <div className="name-title">  
                            <p className="member-name">{member.inviteeName}</p>
                            {member.isOwner && <span className="owner-badge">나</span>}
                          </div>
                          <p className="member-tag">#{member.tag}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <Navbar/>
      </div>
    );
};

export default SharedList;