import React from 'react'
import { useState } from 'react';
import search_icon from '/icons/search.png';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './AddFriend.css'

const AddFriend = () => {
  const [searchFriend, setSearchFriend] = useState("");
  const [selectedFriend, setSelectedFriend] = useState([]);

  const friendList = [
      { name: '김멋사', profile: '/profile-img.png'},
      { name: '김친구', profile: '/profile-img.png'},
      { name: '이친구', profile: '/profile-img.png'},
      { name: '최친구', profile: '/profile-img.png'},
    ];
  
    const filteredFriendList = friendList.filter(friend => friend.name.includes(searchFriend));
  
    const toggleFriend = (friendName) => {
      setSelectedFriend((prev) =>
        prev.includes(friendName)
          ? prev.filter((name) => name !== friendName)
          : [...prev, friendName]
      );
    };

  return (
    <div className='add-friend'>
      <Header toBack={true}/>
        <div className="add-friend-container">
                <div className="friend-search">
                  <img src={search_icon} alt="검색" className='search-icon'/>
                  <input type="search" placeholder='이름을 입력하세요' onChange={(e)=>setSearchFriend(e.target.value)} className='friend-search-bar'/>
                </div>
              <div className="friend-list">
                {filteredFriendList.map((friend) => (
                  <div 
                    className={`friend-list-row ${selectedFriend.includes(friend.name) ? 'selected' : ''}`}
                    key={friend.name} 
                    onClick={() => toggleFriend(friend.name)}>
                    <div className="friend-profile">
                      <img src={friend.profile} alt="" className='profile-img'/>
                      <p>{friend.name}</p>
                    </div>
                    <input type="checkbox" 
                      checked={selectedFriend.includes(friend.name)} />
                  </div>
                ))}
              </div>
              {
                (selectedFriend.length > 0) &&
                <div className="yes-selected">
                  {selectedFriend.map((friend, index) => (
                  <div 
                    className={`friend-list-row ${selectedFriend.includes(friend.name) ? 'selected' : ''}`}
                    key={index} 
                    onClick={() => toggleFriend(friend.name)}>
                    <div className="friend-profile">
                      <img src={friend.profile} alt="" className='profile-img'/>
                      <p>{friend.name}</p>
                    </div>
                    {/* <input type="checkbox" 
                      checked={selectedFriend.includes(friend.name)} /> */}
                  </div>
                ))}
                </div>
              }
              
              </div>
      <Navbar/>
    </div>
  )
}

export default AddFriend