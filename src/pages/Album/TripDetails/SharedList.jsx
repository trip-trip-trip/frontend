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
import { useLocation } from 'react-router-dom';

// 📝 API 응답을 가정한 더미 데이터
const tripData = {
  tripId: 10,
  tripTitle: "도쿄 여행", 
  direction: "SENT",
  
  // ⚠️ API 응답에 없는 데이터는 명시적으로 추가
  startDate: "2025-10-15", // 날짜 정보 추가
  endDate: "2025-10-30",   // 날짜 정보 추가

  invitations: [
      { 
          invitationId: 101, inviterUserId: 1, inviterName: "owner_user", inviteeUserId: 2, 
          inviteeName: "차분한박하영웅", status: "PENDING", createdAt: "2025-11-21T11:30:00", 
          respondedAt: null, tag: "gamja_1212", isOwner: false // isOwner 추가 (가정)
      },
      { 
          invitationId: 102, inviterUserId: 1, inviterName: "dkjsflk", inviteeUserId: 3, 
          inviteeName: "차분한박", status: "PENDING", createdAt: "2025-11-21T11:30:00", 
          respondedAt: null, tag: "gamja_1213", isOwner: false
      },
      { 
        invitationId: 104, inviterUserId: 1, inviterName: "dkdkjf", inviteeUserId: 9, 
        inviteeName: "여미사", status: "ACCEPTED", createdAt: "2025-11-21T11:30:00", 
        respondedAt: null, tag: "gamja_1222", isOwner: true // 오너는 ACCEPTED로 간주 (가정)
    },
  ]
};

const DropdownIcon = ({ isOpen }) => (
    <span className={`dropdown-icon ${isOpen ? 'open' : ''}`}>{isOpen ? <img src={dropdown_icon} className='dropdown open' alt="닫기"/> : <img src={dropdown_icon} className='dropdown closed' alt="열기"/>}</span>
);

const SharedList = () => {
    const [isPendingOpen, setIsPendingOpen] = useState(true);
    const [isMembersOpen, setIsMembersOpen] = useState(true);
    const location = useLocation();

    const invitationData = location.state?.inviteInfo || [];
    const tripName = location.state?.name || '';
    const startDate = location.state?.startDate || '';
    const endDate = location.state?.endDate || '';

    const [confirmedMembers, setConfirmedMembers] = useState([]);
    const [pendingInvitations, setPendingInvitations] = useState([]);


    useEffect(() => {
        const pendingList = [];
        const confirmedList = [];
        
        invitationData.forEach((i) => { // map 대신 forEach 사용 권장
            if (i.status === "PENDING"){
                pendingList.push(i);
            } else if (i.status === "ACCEPTED") { // 확정 상태 추가
                confirmedList.push(i)
            }
        });
        
        setConfirmedMembers(confirmedList);
        setPendingInvitations(pendingList);
        
    }, [invitationData]); // 💡 빈 배열 의존성: 컴포넌트 마운트 시 딱 한 번만 실행

    const handleEditClick = () => {
        alert("여행 수정 페이지로 이동합니다.");
    };

    return (
      <div className='shared-list'>
          <Header toBack={true} />
          <div className="shared-list-container">
            {/* 여행정보 */}
            <div className='trip-detail-container'>
              <div className="trip-info-section">
                <h1>{tripName}</h1> 
                <div className="date-edit-section">
                  <div className="date-range">
                    {/* 💡 상태 변수를 사용하거나, tripData 값을 바로 사용 */}
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
                  {/* 🚀 tripData.pendingInvitations 대신 가공된 pendingInvitations 상태 사용 */}
                  {pendingInvitations.map((invitee) => (
                    <div className="member-row" key={invitee.invitationId}> {/* 🔑 Key는 invitationId 사용 */}
                      <div className="profile-info">
                        <div className="profile-circle"></div>
                        <div className="name-tag-wrapper">
                          <p className="member-name">{invitee.inviteeName}</p> {/* 🔑 inviteeName 사용 */}
                          <p className="member-tag">#{invitee.tag}</p>
                        </div>
                      </div>
                      <div className="status-actions">
                        <span className="status-badge pending">대기중</span>
                        <img src={cancel_btn} alt="취소 버튼" className='cancel-btn'/>
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
                  {/* 🚀 tripData.confirmedMembers 대신 가공된 confirmedMembers 상태 사용 */}
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