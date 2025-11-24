import React from 'react';
import './sharedFriends.css';
import add_icon from '/icons/add_btn.png'
import profile_img from '/profile-img.png'

const SharedFriends = ({ data, invite, onInviteClick }) => {
  const handleInvite = () => {
    if (onInviteClick) {
      onInviteClick();
    } else {
      console.log("친구 초대 버튼 클릭됨");
      alert("친구를 초대합니다!"); 
    }
  };

  return(
    <div className='shared-friends'>
      <div className='shared-profiles'>
        {data.map((friend, index) => (
          <div key={index} className='share-img'>
            {friend.profile ==='none' ? 
              <img src={profile_img} className='shared-profile-img' alt={friend.name || 'Friend Profile'} />
            :
              <img src={friend.profile} className='shared-profile-img' alt={friend.name || 'Friend Profile'} />
            }
          </div>
        ))}
      </div>
      
      {invite && (
        <button className='invite-btn' onClick={handleInvite}>
            <div className="invite-btn-cont">
              <img src={add_icon} alt="초대" className='invite-icon' />
              <p>친구 초대하기</p>
            </div>
        </button>
      )}
    </div>
  )
};

export default SharedFriends;
