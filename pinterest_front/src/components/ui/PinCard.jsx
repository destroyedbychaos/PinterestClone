import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./PinCard.css";
import ReportModal from "./ReportModal";
import NotificationToast from "./NotificationToast";

const PinCard = ({ image, title, description, author, tags, height, pinId, onPinHidden }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [showReportModal, setShowReportModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (!showMenu) {

      const buttonRect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 280; 
      
      setMenuPosition({
        top: buttonRect.bottom + 8, 
        left: buttonRect.right - menuWidth + 40
      });
    }
    setShowMenu(!showMenu);
  };

  const handleMenuClose = () => {
    setShowMenu(false);
  };

  const showNotification = (message, type = 'info') => {
    setNotification({ show: true, message, type });
  };

  const hideNotification = () => {
    setNotification({ show: false, message: '', type: 'info' });
  };

  const handleSeeMoreLikeThis = () => {
    setShowMenu(false);
    showNotification('Добре, будемо показувати таких пінів більше', 'success');
  };

  const handleSeeFewerLikeThis = async () => {
    setShowMenu(false);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showNotification('Необхідно авторизуватися для приховування пінів', 'warning');
        return;
      }

      console.log('Hiding pin with pinId:', pinId);
      console.log('Token:', token.substring(0, 20) + '...');

      const response = await fetch('/api/HiddenPins/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pinId)
      });

      console.log('Hide pin response status:', response.status);
      const responseText = await response.text();
      console.log('Hide pin response text:', responseText);

      if (!response.ok) {
        const responseData = JSON.parse(responseText);
        if (responseData.message === "Pin is already hidden for this user") {
          showNotification('Цей пін вже прихований', 'info');

          if (onPinHidden) {
            onPinHidden(pinId);
          }
          return;
        }
        throw new Error('Помилка при приховуванні піна');
      }

      showNotification('Ми більше цьому акаунту цей пін ніколи не показуємо', 'info');
      

      if (onPinHidden) {
        onPinHidden(pinId);
      }
    } catch (error) {
      console.error('Error hiding pin:', error);
      showNotification(error.message || 'Помилка при приховуванні піна', 'error');
    }
  };

  const handleDownloadImage = () => {
    setShowMenu(false);
    
    try {
      const link = document.createElement('a');
      link.href = image;
      link.download = `${title || 'pin'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showNotification('Зображення завантажується...', 'success');
    } catch (error) {
      console.error('Error downloading image:', error);
      showNotification('Помилка при завантаженні зображення', 'error');
    }
  };

  const handleReport = () => {
    setShowMenu(false);
    
    const token = localStorage.getItem('token');
    if (!token) {
      showNotification('Необхідно авторизуватися для відправки скарги', 'warning');
      return;
    }
    
    setShowReportModal(true);
  };

  const handleReportSubmit = async (pinId, reportMessage) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Необхідно авторизуватися');
      }

      console.log('Sending report with pinId:', pinId, 'reportMessage:', reportMessage);
      console.log('Token:', token.substring(0, 20) + '...');

      const requestBody = {
        PinId: pinId,
        ReportMessage: reportMessage
      };
      console.log('Request body:', requestBody);

      const response = await fetch('/api/PinReports/report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        const responseData = JSON.parse(responseText);
        if (responseData.errors && responseData.errors.ReportMessage) {
          throw new Error('Текст скарги повинен містити мінімум 10 символів');
        }
        throw new Error('Помилка при відправці скарги');
      }

      showNotification('Скаргу успішно відправлено', 'success');
    } catch (error) {
      console.error('Error reporting pin:', error);
      showNotification(error.message || 'Помилка при відправці скарги', 'error');
    }
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && menuRef.current && !menuRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div className="pin-card">
      <img
        src={image}
        alt={title}
        className="pin-card__image"
        onError={e => { e.target.style.background = '#eee'; e.target.src = ''; }}
      />
      

      <button
        ref={buttonRef}
        className="pin-card__menu-button"
        onClick={handleMenuToggle}
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="1.5"/>
          <circle cx="6" cy="12" r="1.5"/>
          <circle cx="18" cy="12" r="1.5"/>
        </svg>
      </button>

      {showMenu && (
        <>

          <div className="pin-card__overlay" onClick={handleMenuClose} />
          
          <div 
            ref={menuRef}
            className="pin-card__menu"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`
            }}
          >
            <div className="pin-card__menu-item" onClick={handleSeeMoreLikeThis}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 20.703L12.343 21.37C12.2369 21.4246 12.1193 21.453 12 21.453C11.8807 21.453 11.7631 21.4246 11.657 21.37L11.654 21.368L11.647 21.365L11.622 21.352C9.76007 20.3419 8.00658 19.1437 6.389 17.776C3.8 15.573 1 12.332 1 8.514V8.513C1 5.053 3.829 2.5 6.736 2.5C9.03 2.5 10.881 3.726 12 5.605C13.12 3.726 14.97 2.5 17.264 2.5C20.17 2.5 23 5.052 23 8.514C23 12.332 20.199 15.574 17.611 17.776C15.9934 19.1437 14.2399 20.3419 12.378 21.352L12.353 21.365L12.346 21.368L12.344 21.369L12 20.703ZM6.736 4C4.657 4 2.5 5.88 2.5 8.514C2.5 11.621 4.824 14.474 7.361 16.634C8.78034 17.8328 10.309 18.8958 11.927 19.809L12 19.85L12.073 19.81C12.344 19.657 12.734 19.43 13.203 19.136C14.143 18.548 15.393 17.695 16.639 16.634C19.176 14.474 21.5 11.621 21.5 8.514C21.5 5.88 19.343 4 17.264 4C15.158 4 13.463 5.389 12.711 7.643C12.6605 7.79149 12.5648 7.92043 12.4373 8.01175C12.3097 8.10307 12.1568 8.15217 12 8.15217C11.8432 8.15217 11.6903 8.10307 11.5627 8.01175C11.4352 7.92043 11.3395 7.79149 11.289 7.643C10.537 5.389 8.841 4 6.736 4Z" fill="#01233F"/>
              </svg>
              <span>See more like this</span>
            </div>
            
            <div className="pin-card__menu-item" onClick={handleSeeFewerLikeThis}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8.05109 5.837C9.29386 5.28429 10.639 4.99912 11.9991 5C14.9541 5 17.3081 6.315 19.0591 7.864C20.8151 9.417 21.9251 11.171 22.3661 11.944C22.3767 11.9604 22.3822 11.9795 22.3821 11.999C22.383 12.0203 22.377 12.0413 22.3651 12.059C21.9146 12.8377 21.403 13.5793 20.8351 14.277C20.769 14.3529 20.7189 14.4413 20.6877 14.5369C20.6565 14.6326 20.6449 14.7335 20.6535 14.8337C20.6622 14.934 20.6909 15.0314 20.7379 15.1203C20.785 15.2093 20.8495 15.2878 20.9275 15.3513C21.0056 15.4148 21.0956 15.4619 21.1922 15.4899C21.2888 15.5178 21.3901 15.5261 21.49 15.5141C21.5899 15.5022 21.6863 15.4702 21.7736 15.4202C21.8609 15.3702 21.9373 15.3031 21.9981 15.223C22.6198 14.4632 23.1784 13.6539 23.6681 12.803C23.8081 12.5593 23.8818 12.2832 23.882 12.0021C23.8822 11.7211 23.8088 11.4449 23.6691 11.201C23.1841 10.351 21.9791 8.444 20.0531 6.741C18.1231 5.034 15.4311 3.5 11.9991 3.5C10.3041 3.5 8.78409 3.874 7.44709 4.463C7.26601 4.54373 7.12425 4.69289 7.05283 4.87785C6.98142 5.06281 6.98614 5.26853 7.06598 5.45001C7.14582 5.6315 7.29427 5.77398 7.47888 5.84632C7.66348 5.91865 7.86922 5.91594 8.05109 5.837ZM19.1651 17.987C17.3271 19.38 14.9321 20.5 11.9991 20.5C8.56709 20.5 5.87409 18.966 3.94509 17.26C2.01909 15.556 0.813094 13.648 0.329094 12.798C0.188817 12.5547 0.115059 12.2787 0.115235 11.9979C0.11541 11.717 0.189513 11.4411 0.330094 11.198C1.22494 9.64725 2.34251 8.23622 3.64709 7.01L1.31609 5.362C1.23257 5.30645 1.16104 5.2347 1.10574 5.15102C1.05043 5.06733 1.01248 4.9734 0.99412 4.87478C0.975762 4.77617 0.977373 4.67487 0.998857 4.57689C1.02034 4.4789 1.06126 4.38623 1.1192 4.30434C1.17714 4.22245 1.25091 4.15302 1.33616 4.10015C1.4214 4.04728 1.51639 4.01205 1.61549 3.99654C1.7146 3.98103 1.8158 3.98556 1.91313 4.00985C2.01045 4.03415 2.10191 4.07773 2.18209 4.138L22.6821 18.638C22.7656 18.6936 22.8371 18.7653 22.8925 18.849C22.9478 18.9327 22.9857 19.0266 23.0041 19.1252C23.0224 19.2238 23.0208 19.3251 22.9993 19.4231C22.9778 19.5211 22.9369 19.6138 22.879 19.6957C22.8211 19.7775 22.7473 19.847 22.662 19.8999C22.5768 19.9527 22.4818 19.988 22.3827 20.0035C22.2836 20.019 22.1824 20.0144 22.0851 19.9901C21.9877 19.9658 21.8963 19.9223 21.8161 19.862L19.1651 17.987ZM4.90109 7.898C3.17109 9.439 2.07309 11.171 1.63309 11.942C1.62138 11.9594 1.61543 11.98 1.61609 12.001C1.61476 12.0163 1.62009 12.0347 1.63209 12.056C2.07309 12.83 3.18309 14.583 4.93909 16.136C6.68909 17.685 9.04409 19 11.9991 19C14.3331 19 16.2891 18.18 17.8731 17.073L14.3571 14.586C13.7675 15.1243 13.0115 15.4448 12.2147 15.4944C11.4178 15.544 10.628 15.3197 9.97616 14.8586C9.32434 14.3976 8.84974 13.7275 8.6311 12.9597C8.41246 12.1918 8.46291 11.3722 8.77409 10.637L4.90109 7.899V7.898Z" fill="#01233F"/>
              </svg>
              <span>See fewer like this</span>
            </div>
            
            <div className="pin-card__menu-item" onClick={handleDownloadImage}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4.75 17.25C4.94891 17.25 5.13968 17.329 5.28033 17.4697C5.42098 17.6103 5.5 17.8011 5.5 18V20.25C5.5 20.388 5.612 20.5 5.75 20.5H18.25C18.3163 20.5 18.3799 20.4737 18.4268 20.4268C18.4737 20.3799 18.5 20.3163 18.5 20.25V18C18.5 17.8011 18.579 17.6103 18.7197 17.4697C18.8603 17.329 19.0511 17.25 19.25 17.25C19.4489 17.25 19.6397 17.329 19.7803 17.4697C19.921 17.6103 20 17.8011 20 18V20.25C20 20.7141 19.8156 21.1592 19.4874 21.4874C19.1592 21.8156 18.7141 22 18.25 22H5.75C5.28587 22 4.84075 21.8156 4.51256 21.4874C4.18437 21.1592 4 20.7141 4 20.25V18C4 17.8011 4.07902 17.6103 4.21967 17.4697C4.36032 17.329 4.55109 17.25 4.75 17.25Z" fill="#01233F"/>
                <path d="M5.21934 9.97C5.35997 9.82955 5.55059 9.75066 5.74934 9.75066C5.94809 9.75066 6.13871 9.82955 6.27934 9.97L11.2493 14.939V2.75C11.2493 2.55109 11.3284 2.36032 11.469 2.21967C11.6097 2.07902 11.8004 2 11.9993 2C12.1983 2 12.389 2.07902 12.5297 2.21967C12.6703 2.36032 12.7493 2.55109 12.7493 2.75V14.939L17.7193 9.97C17.8599 9.82944 18.0506 9.75047 18.2493 9.75047C18.4481 9.75047 18.6388 9.82944 18.7793 9.97C18.9199 10.1106 18.9989 10.3012 18.9989 10.5C18.9989 10.6988 18.9199 10.8894 18.7793 11.03L12.5293 17.28C12.3887 17.4205 12.1981 17.4993 11.9993 17.4993C11.8006 17.4993 11.61 17.4205 11.4693 17.28L5.21934 11.03C5.07889 10.8894 5 10.6988 5 10.5C5 10.3012 5.07889 10.1106 5.21934 9.97Z" fill="#01233F"/>
              </svg>
              <span>Download image</span>
            </div>
            
            <div className="pin-card__menu-item" onClick={handleReport}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 1C18.075 1 23 5.925 23 12C23 18.075 18.075 23 12 23C5.925 23 1 18.075 1 12C1 5.925 5.925 1 12 1ZM5.834 19.227C7.55167 20.6972 9.73908 21.5035 12 21.5C14.5196 21.5 16.9359 20.4991 18.7175 18.7175C20.4991 16.9359 21.5 14.5196 21.5 12C21.5035 9.73908 20.6972 7.55167 19.227 5.834L5.834 19.227ZM2.5 12C2.49649 14.2609 3.30285 16.4483 4.773 18.166L18.166 4.773C16.4483 3.30285 14.2609 2.49649 12 2.5C9.48044 2.5 7.06408 3.50089 5.28249 5.28249C3.50089 7.06408 2.5 9.48044 2.5 12Z" fill="#01233F"/>
              </svg>
              <span>Report</span>
            </div>
          </div>
        </>
      )}


      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReportSubmit}
        pinId={pinId}
        pinTitle={title}
      />

      <NotificationToast
        isVisible={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={hideNotification}
      />
    </div>
  );
};

PinCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  author: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  pinId: PropTypes.string,
  onPinHidden: PropTypes.func,
};

export default PinCard;
