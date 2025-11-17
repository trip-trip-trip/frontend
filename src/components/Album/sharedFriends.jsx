import React from 'react';
import './sharedFriends.css';

const SharedFriends = ({ data }) => {
  return (
    <div className='shared-friends'>
      <div className='shared-profiles'>
        {data.map((friend, index) => (
          <div key={index} className='share-img'>
            <img src={friend.profile} className='shared-profile-img' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SharedFriends;
