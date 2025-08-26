import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import HistoryPinCard from "../../components/ui/HistoryPinCard";
import PinViewModal from "../../components/PinViewModal";
import historyApiService from "../../services/historyApi";
import { logout } from "../../../store/slices/AuthSlice";
import { 
  getUserDisplayName, 
  getUserAvatarInitial, 
  getUserUsername, 
  hasUserAvatar, 
  getUserAvatarUrl
} from "../../utils/userUtils";
import "./HistoryPage.css";

const HistoryContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: white;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 48px 40px;
  box-sizing: border-box;
  position: relative;
  box-shadow: 3px 0px 38.7px 2px rgba(111, 145, 217, 0.25);
  border-top-left-radius: 40px;
  border-bottom-left-radius: 40px;
`;

const UserBox = styled.div`
  width: 267px;
  height: 64px;
  padding: 8px;
  position: absolute;
  top: 48px;
  right: 40px;
  background: white;
  border-radius: 100px;
  outline: 1px #B4C6EB solid;
  outline-offset: -1px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 10;
  cursor: pointer;
  
  @media (max-width: 768px) {
    position: relative;
    top: auto;
    right: auto;
    margin-bottom: 24px;
  }
`;

const Avatar = styled.img`
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserName = styled.div`
  flex: 1;
  text-align: center;
  color: #000D17;
  font-size: 21px;
  font-family: Geologica, sans-serif;
  font-weight: 600;
`;

const HistoryTitle = styled.h1`
  color: #000D17;
  font-size: 51px;
  font-family: Geologica, sans-serif;
  font-weight: 700;
  margin: 0 0 60px 0;
`;

const CenteredContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  margin: 100px 0 60px 0;
  text-align: center;
`;

const RecentlyViewedTitle = styled.h2`
  color: #000D17;
  font-size: 38px;
  font-family: Geologica, sans-serif;
  font-weight: 700;
  margin: 0;
`;

const RecentlyViewedDescription = styled.p`
  color: #52697C;
  font-size: 21px;
  font-family: Geologica, sans-serif;
  font-weight: 400;
  margin: 0;
`;

const DateSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 40px;
  width: 100%;
`;

const DateTitle = styled.h3`
  color: #000D17;
  font-size: 28px;
  font-family: Geologica, sans-serif;
  font-weight: 600;
  margin: 0;
`;

const ImageGallery = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 12px;
  width: 100%;
  
  @media (max-width: 1400px) {
    grid-template-columns: repeat(5, 1fr);
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 400px) {
    grid-template-columns: 1fr;
  }
`;





const EndMessage = styled.p`
  text-align: center;
  color: #52697C;
  font-size: 21px;
  font-family: Geologica, sans-serif;
  font-weight: 400;
  margin: 60px 0;
`;



const HistoryPage = () => {
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [historyData, setHistoryData] = useState({ today: [], yesterday: [], older: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPin, setSelectedPin] = useState(null);
  const [showPinViewModal, setShowPinViewModal] = useState(false);
  const profileRef = useRef(null);
  const menuRef = useRef(null);

  const handleImageClick = (pinId) => {
    // Знаходимо пін в історії
    const allViews = [
      ...historyData.today,
      ...historyData.yesterday,
      ...historyData.older
    ];
    
    const view = allViews.find(v => v.pinId === pinId);
    if (view) {
      const pinData = {
        id: view.pinId,
        imageUrl: view.pinImageUrl,
        title: view.pinTitle,
        description: view.pinDescription,
        author: view.pinAuthorName,
        likes: 0 
      };
      
      setSelectedPin(pinData);
      setShowPinViewModal(true);
      
 
    }
  };


  const handleProfileClick = () => {
    setIsProfileModalOpen(true);
  };

  const handleUserBoxClick = () => {
    setShowMenu(v => !v);
  };

  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  const groupHistoryByDate = (views) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const grouped = { today: [], yesterday: [], older: [] };
    
    const uniqueViews = views.filter((view, index, self) => 
      index === self.findIndex(v => v.pinId === view.pinId)
    );
    
    uniqueViews.forEach(view => {
      const viewDate = new Date(view.viewedAt);
      viewDate.setHours(0, 0, 0, 0);
      
      if (viewDate.getTime() === today.getTime()) {
        grouped.today.push(view);
      } else if (viewDate.getTime() === yesterday.getTime()) {
        grouped.yesterday.push(view);
      } else {
        grouped.older.push(view);
      }
    });
    
    return grouped;
  };

  const getImageHeight = (imageUrl, index = 0) => {

    const heights = ['267px', '412px', '558px'];
    return heights[index % heights.length];
  };

  const formatOlderDate = (dateString) => {
    const date = new Date(dateString);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${months[date.getMonth()]}, ${date.getDate()}`;
  };

  const groupOlderByDate = (olderViews) => {
    const grouped = {};
    olderViews.forEach(view => {
      const dateKey = formatOlderDate(view.viewedAt);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(view);
    });
    return grouped;
  };



  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('⚠️ Користувач не авторизований, показуємо пустий стан');
          setShowEmptyState(true);
          setLoading(false);
          return;
        }
        
        console.log('🔄 Завантажую історію переглядів...');
        const response = await historyApiService.getUserViewHistory();
        console.log('📋 Отримана історія:', response);
        console.log('📦 Payload:', response.payload);
        
        if (response.success && response.payload) {
          console.log('👁️ Views:', response.payload.views);
          console.log('📊 Кількість views:', response.payload.views ? response.payload.views.length : 0);
          
          if (response.payload.views && response.payload.views.length > 0) {
            const groupedData = groupHistoryByDate(response.payload.views);
            setHistoryData(groupedData);
            console.log('📊 Згрупована історія:', groupedData);
            
            const hasData = groupedData.today.length > 0 || 
                           groupedData.yesterday.length > 0 || 
                           groupedData.older.length > 0;
            
            if (!hasData) {
              console.log('📭 Немає даних для відображення');
              setShowEmptyState(true);
            }
          } else {
            console.log('📭 Масив views порожній або не існує');
            setShowEmptyState(true);
          }
        } else {
          console.log('📭 Відповідь не містить даних');
          setShowEmptyState(true);
        }
      } catch (err) {
        console.error('❌ Помилка завантаження історії:', err);
        setError('Failed to load history data');
        setShowEmptyState(true);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handlePinViewClose = () => {
    setShowPinViewModal(false);
    setSelectedPin(null);
    
    setTimeout(() => {
      const fetchHistory = async () => {
        try {
          const response = await historyApiService.getUserViewHistory();
          if (response.success && response.payload) {
            const groupedData = groupHistoryByDate(response.payload.views);
            setHistoryData(groupedData);
          }
        } catch (err) {
          console.error('Error updating history:', err);
        }
      };
      fetchHistory();
    }, 100);
  };

  if (loading) {
    return (
      <HistoryContainer className="history-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <div className="loading-text">Завантаження історії...</div>
        </div>
      </HistoryContainer>
    );
  }

  if (error) {
    return (
      <HistoryContainer className="history-container">
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <div className="error-text">{error}</div>
          <button className="retry-button" onClick={() => window.location.reload()}>
            Спробувати знову
          </button>
        </div>
      </HistoryContainer>
    );
  }

         if (showEmptyState) {
           return (
      <HistoryContainer className="history-container">
        <UserBox className="user-box" onClick={handleUserBoxClick} ref={profileRef}>
          <Avatar 
            src={user?.avatarUrl || "https://placehold.co/42x42"} 
            alt="User avatar"
          />
          <UserName>
            {user?.displayName || "Vita Didovets"}
          </UserName>
          {showMenu && (
            <div className="profile-dropdown-menu" ref={menuRef} tabIndex={-1}>
              <div className="profile-dropdown-menu__current">Currently in</div>
              <div className="profile-dropdown-menu__user">
                {hasUserAvatar(user) ? (
                  <img src={getUserAvatarUrl(user)} alt="avatar" className="profile-dropdown-menu__avatar" />
                ) : (
                  <span className="profile-dropdown-menu__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 56, height: 56, color: '#6b7280', fontSize: '18px', fontWeight: 600 }}>
                    {getUserAvatarInitial(user)}
                  </span>
                )}
                <div className="profile-dropdown-menu__info">
                  <div className="profile-dropdown-menu__name">{getUserDisplayName(user)}</div>
                  <div className="profile-dropdown-menu__username">@{getUserUsername(user)}</div>
                </div>
              </div>
              <div className="profile-dropdown-menu__accounts">Your accounts</div>
              <button className="profile-dropdown-menu__btn" onClick={() => { setShowMenu(false); navigate('/register'); }}>Add account</button>
              <button className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout" onClick={() => { 
                dispatch(logout()); 
                setShowMenu(false); 
                window.location.reload(); 
              }}>Log out</button>
            </div>
          )}
        </UserBox>

        <HistoryTitle className="history-title">History</HistoryTitle>

        <CenteredContent className="centered-content">
          <RecentlyViewedTitle className="recently-viewed-title">Recently viewed</RecentlyViewedTitle>
          <RecentlyViewedDescription className="recently-viewed-description">
            This is where you can find Aests you've viewed in the last 30 days.
          </RecentlyViewedDescription>
        </CenteredContent>
      </HistoryContainer>
    );
  }

  const olderGrouped = groupOlderByDate(historyData.older);

     return (
     <HistoryContainer className="history-container">
       <UserBox className="user-box" onClick={handleUserBoxClick} ref={profileRef}>
         <Avatar 
           src={user?.avatarUrl || "https://placehold.co/42x42"} 
           alt="User avatar"
         />
         <UserName>
           {user?.displayName || "Vita Didovets"}
         </UserName>
         {showMenu && (
           <div className="profile-dropdown-menu" ref={menuRef} tabIndex={-1}>
             <div className="profile-dropdown-menu__current">Currently in</div>
             <div className="profile-dropdown-menu__user">
               {hasUserAvatar(user) ? (
                 <img src={getUserAvatarUrl(user)} alt="avatar" className="profile-dropdown-menu__avatar" />
               ) : (
                 <span className="profile-dropdown-menu__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 56, height: 56, color: '#6b7280', fontSize: '18px', fontWeight: 600 }}>
                   {getUserAvatarInitial(user)}
                 </span>
               )}
               <div className="profile-dropdown-menu__info">
                 <div className="profile-dropdown-menu__name">{getUserDisplayName(user)}</div>
                 <div className="profile-dropdown-menu__username">@{getUserUsername(user)}</div>
               </div>
             </div>
             <div className="profile-dropdown-menu__accounts">Your accounts</div>
             <button className="profile-dropdown-menu__btn" onClick={() => { setShowMenu(false); navigate('/register'); }}>Add account</button>
             <button className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout" onClick={() => { 
               dispatch(logout()); 
               setShowMenu(false); 
               window.location.reload(); 
             }}>Log out</button>
           </div>
         )}
       </UserBox>

      <HistoryTitle className="history-title">History</HistoryTitle>

      <CenteredContent className="centered-content">
        <RecentlyViewedTitle className="recently-viewed-title">Recently viewed</RecentlyViewedTitle>
        <RecentlyViewedDescription className="recently-viewed-description">
          This is where you can find Aests you've viewed in the last 30 days.
        </RecentlyViewedDescription>
      </CenteredContent>

                    {historyData.today.length > 0 && (
          <DateSection className="date-section">
            <DateTitle className="date-title">Today</DateTitle>
            <ImageGallery className="image-gallery">
              {historyData.today.map((view, index) => (
                <HistoryPinCard
                  key={view.id}
                  image={view.pinImageUrl || "https://placehold.co/267x412"}
                  height={getImageHeight(view.pinImageUrl, index)}
                  viewedAt={new Date(view.viewedAt)}
                  onClick={() => handleImageClick(view.pinId)}
                  alt={view.pinTitle || "History image"}
                  title={view.pinTitle}
                  author={view.pinAuthorName}
                />
              ))}
            </ImageGallery>
          </DateSection>
        )}

                    {historyData.yesterday.length > 0 && (
          <DateSection className="date-section">
            <DateTitle className="date-title">Yesterday</DateTitle>
            <ImageGallery className="image-gallery">
              {historyData.yesterday.map((view, index) => (
                <HistoryPinCard
                  key={view.id}
                  image={view.pinImageUrl || "https://placehold.co/267x412"}
                  height={getImageHeight(view.pinImageUrl, index)}
                  viewedAt={new Date(view.viewedAt)}
                  onClick={() => handleImageClick(view.pinId)}
                  alt={view.pinTitle || "History image"}
                  title={view.pinTitle}
                  author={view.pinAuthorName}
                />
              ))}
            </ImageGallery>
          </DateSection>
        )}

                    {Object.entries(olderGrouped).map(([dateKey, views]) => (
          <DateSection key={dateKey} className="date-section">
            <DateTitle className="date-title">{dateKey}</DateTitle>
            <ImageGallery className="image-gallery">
              {views.map((view, index) => (
                <HistoryPinCard
                  key={view.id}
                  image={view.pinImageUrl || "https://placehold.co/267x412"}
                  height={getImageHeight(view.pinImageUrl, index)}
                  viewedAt={new Date(view.viewedAt)}
                  onClick={() => handleImageClick(view.pinId)}
                  alt={view.pinTitle || "History image"}
                  title={view.pinTitle}
                  author={view.pinAuthorName}
                />
              ))}
            </ImageGallery>
          </DateSection>
        ))}

             <EndMessage className="end-message">That's all for now!</EndMessage>

       <PinViewModal
        pin={selectedPin}
        isOpen={showPinViewModal}
        onClose={handlePinViewClose}
        source="history"
        onLike={(pinId, isLiked) => {
          console.log('Pin liked:', pinId, isLiked);
        }}
        onComment={(pinId, comment) => {
          console.log('Comment added:', pinId, comment);
        }}
        onSave={(pinId) => {
          console.log('Pin saved:', pinId);
        }}
      />
    </HistoryContainer>
  );
};

export default HistoryPage;
