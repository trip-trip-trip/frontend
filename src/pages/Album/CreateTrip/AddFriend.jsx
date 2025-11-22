import React from 'react'
import { useState } from 'react';
import search_icon from '/icons/search.png';
import Header from '../../../components/Header/Header';
import Navbar from '../../../components/NavBar/NavBar';
import './AddFriend.css'

const AddFriend = () => {
  const [searchFriend, setSearchFriend] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
// 더미값
  const friendList = [
      { id: 11, username: '사람', tag: 'person', avatarUrl: '/profile-img.png', bio: '안녕하세요'},
      { id: 12, username: '사라', tag: 'sara', avatarUrl: '', bio: '여행 좋아해요'},
      { id: 13, username: '또사람', tag: 'another', avatarUrl: '', bio: 'react 개발자'},
      { id: 14, username: '눈사람', tag: 'snowman', avatarUrl: '/profile-img.png', bio: '겨울 조아요'},
      { id: 15, username: '김멋사', tag: 'musa', avatarUrl: '', bio: '프론트엔드'},
      { id: 16, username: '김친구', tag: 'kimfriend', avatarUrl: '', bio: '같이 가자'},
  ];
  
    // 검색 필터링 (username으로 필터링)
    const filteredFriendList = friendList.filter(friend => friend.username.includes(searchFriend));
  
    // 이미 선택된 친구인지 확인하는 헬퍼 함수 (id 사용)
    const isSelected = (friend) => selectedFriends.some(selected => selected.id === friend.id);

    const toggleFriend = (friendToToggle) => {
      setSelectedFriends((prev) =>
        isSelected(friendToToggle)
          ? prev.filter((friend) => friend.id !== friendToToggle.id) // 선택 해제
          : [...prev, friendToToggle] // 선택 추가
      );
    };

    // 하단에 표시되는 선택된 친구 항목에서 X 아이콘 클릭 시 (id 사용)
    const removeFriend = (friendToRemove) => {
      setSelectedFriends((prev) => 
        prev.filter((friend) => friend.id !== friendToRemove.id)
      );
    };

    const handleFriendBtn = () => {
      console.log(selectedFriends);
    }
    


  return (
    <div className='add-friend'>
      {/* Header 컴포넌트가 title/subtitle props를 받는다고 가정 */}
      <Header 
        toBack={true}
        title="도쿄 여행"
      />
      <div className="add-friend-container">
        <div className="friend-search-wrapper">
          <div className="friend-search">
            <img src={search_icon} alt="검색" className='search-icon'/>
            <input 
              type="search" 
              placeholder='이름을 입력하세요' 
              onChange={(e)=>setSearchFriend(e.target.value)} 
              className='friend-search-bar'
            />
          </div>
        </div>
          
        <div className="friend-list">
          {filteredFriendList.map((friend) => (
            <div 
              className={`friend-list-row ${isSelected(friend) ? 'selected' : ''}`}
              key={friend.id}
              onClick={() => toggleFriend(friend)}>
              <div className="friend-profile">
                {friend.avatarUrl 
                ? <img src={friend.avatarUrl} alt={""} className='profile-img'/>
                : <div className="profile-circle">
                  </div>
                }
                <p className='friend-name'>{friend.username}</p>
              </div>
              {/* 선택 상태를 나타내는 사각형 */}
              <div className={`selection-box ${isSelected(friend) ? 'checked' : 'unchecked'}`}>
              </div>
            </div>
          ))}
        </div>
        {
          selectedFriends.length>0 &&
          <div className="selected-friends-bottom">
            <div className="selected-friends-list">
                {selectedFriends.map((friend) => (
                    <div className="selected-friend-item" key={friend.id}>
                        <div className="profile-circle selected-profile" onClick={() => removeFriend(friend)}>
                            <span className="remove-icon">×</span>
                        </div>
                        <p className='selected-name'>{friend.username}</p>
                    </div>
                ))}
            </div>
            <div className="invite-button-wrapper">
            <button className='invite-button' onClick={handleFriendBtn}>
                {selectedFriends.length}명 초대하기
            </button>
          </div>
        </div>
        }              
      
      </div>
    </div>
  )
}

export default AddFriend