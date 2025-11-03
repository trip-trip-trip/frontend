import React from 'react';
import './sharedFriends.css';

const SharedFriends = ({ data }) => {
  return (
    <div className='shared-friends'>
      <div className='shared-profiles'>
        {data.map((friend, index) => (
          <div key={index} className='share-profile-img'>
            <img src={friend.profile} className='profile-img' />
          </div>
        ))}
      </div>
      <p className='shared-friends-count'>나 + 친구 {data.length}명</p>
    </div>
  );
};

export default SharedFriends;
