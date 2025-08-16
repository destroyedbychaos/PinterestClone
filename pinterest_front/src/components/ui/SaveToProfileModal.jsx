import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './SaveToProfileModal.css';

const SaveToProfileModal = ({ isOpen, onClose, onSave, pinData, buttonPosition, onMouseEnter, onMouseLeave }) => {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchBoards();
    }
  }, [isOpen]);

  const fetchBoards = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }


      const payload = JSON.parse(atob(token.split('.')[1]));
      const userId = payload?.sub || payload?.id || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
      
      if (!userId) {
        console.error('Could not extract user ID from token');
        return;
      }

      const response = await fetch(`/api/boards/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched boards:', data);
        setBoards(data?.Boards || data?.boards || []);
      } else {
        console.error('Failed to fetch boards:', response.status);
      }
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToProfile = () => {
    console.log('Saving to profile:', pinData);
    if (onSave) {
      onSave(pinData, null); 
    }
    onClose();
  };

  const handleSaveToBoard = (boardId) => {
    console.log('Saving to board:', boardId, pinData);
    if (onSave) {
      onSave(pinData, boardId);
    }
    onClose();
  };

  const handleCreateNewBoard = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

             const boardName = prompt('Введіть назву дошки:');
      if (!boardName || boardName.trim() === '') {
        return;
      }

      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          Name: boardName.trim(),
          Description: 'Created from save modal',
          IsPrivate: false
        })
      });

      if (response.ok) {
        const newBoard = await response.json();
        setBoards(prev => [...prev, newBoard]);

        if (onSave) {
          onSave(pinData, newBoard.Id || newBoard.id);
        }
        onClose();
             } else {
         console.error('Failed to create board:', response.status);
         alert('Помилка створення дошки. Спробуйте ще раз.');
       }
         } catch (error) {
       console.error('Error creating board:', error);
       alert('Помилка створення дошки. Спробуйте ще раз.');
     }
  };

  if (!isOpen) return null;

  const getModalPosition = () => {
    if (!buttonPosition) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const modalWidth = 320;
    const modalHeight = 400;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let top = buttonPosition.top + buttonPosition.height + 8;
    let left = buttonPosition.left - (modalWidth - buttonPosition.width) / 2;


    if (top + modalHeight > windowHeight) {
      top = buttonPosition.top - modalHeight - 8;
    }

    if (left + modalWidth > windowWidth) {
      left = windowWidth - modalWidth - 20;
    }

    if (left < 20) {
      left = 20;
    }

    return {
      top: `${top}px`,
      left: `${left}px`
    };
  };

  return (
    <div className="save-modal-overlay" onClick={onClose}>
      <div 
        className="save-modal" 
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={getModalPosition()}
      >
                 <div className="save-modal-header">
           <h3>Зберегти в...</h3>
           <button className="save-modal-close" onClick={onClose}>
             ✕
           </button>
         </div>
        
        <div className="save-modal-content">

          <div className="save-option" onClick={handleCreateNewBoard}>
            <div className="save-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="#666" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
                         <div className="save-option-text">
               <span className="save-option-title">Створити нову дошку</span>
             </div>
          </div>

          <div className="save-option" onClick={handleSaveToProfile}>
            <div className="save-option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#666" strokeWidth="2"/>
              </svg>
            </div>
                         <div className="save-option-text">
               <span className="save-option-title">Зберегти в профіль</span>
             </div>
          </div>


                     {loading ? (
             <div className="save-loading">Завантаження дошок...</div>
           ) : (
            <div className="save-boards-list">
              {boards.map((board) => (
                                 <div 
                   key={board.Id || board.id} 
                   className="save-option"
                   onClick={() => handleSaveToBoard(board.Id || board.id)}
                 >
                  <div className="save-option-thumbnail">
                    {board.thumbnailUrl ? (
                      <img src={board.thumbnailUrl} alt={board.name} />
                    ) : (
                      <div className="save-option-placeholder">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#ccc"/>
                        </svg>
                      </div>
                    )}
                  </div>
                                     <div className="save-option-text">
                     <span className="save-option-title">{board.Name || board.name}</span>
                     <span className="save-option-count">{board.BoardPins?.length || board.boardPins?.length || 0} Aests</span>
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

SaveToProfileModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  pinData: PropTypes.object,
  buttonPosition: PropTypes.shape({
    top: PropTypes.number,
    left: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number
  }),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func
};

export default SaveToProfileModal;
