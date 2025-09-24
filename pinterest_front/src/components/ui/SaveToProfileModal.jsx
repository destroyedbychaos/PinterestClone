import React, { useState, useEffect, forwardRef } from 'react';
import PropTypes from 'prop-types';
import './SaveToProfileModal.css';
import { useNavigate } from 'react-router-dom';
import { useGetUserBoardsQuery, useCreateBoardMutation } from '../../../store/Boards/BoardsApi';
import CreateBoardModal from './CreateAestComponents/CreateBoardModal';

const SaveToProfileModal = forwardRef(({
  isOpen,
  onClose,
  onSave,
  pinData,
  buttonPosition,
  onMouseEnter,
  onMouseLeave
}, ref) => {
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const userId = payload?.sub || payload?.id || payload?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];

  const { data, isLoading, refetch } = useGetUserBoardsQuery({ userId }, { skip: !isOpen || !userId });
  const [createBoard, { isLoading: isCreating }] = useCreateBoardMutation();

  useEffect(() => {
    if (!isOpen) {
      setIsCreateBoardOpen(false);
    }
  }, [isOpen]);

  const handleSaveToProfile = () => {
    if (onSave) onSave(pinData, null); 
  };

  const handleSaveToBoard = (boardId) => {
    if (onSave) onSave(pinData, boardId);
  };

  const handleCreateNewBoard = () => {
    setIsCreateBoardOpen(true);
  };

  const handleCloseCreateBoard = () => {
    setIsCreateBoardOpen(false);
  };

  const handleBoardCreated = async (name, isPrivate, invitedUsers) => {
    try {
      const newBoard = await createBoard({
        name,
        description: 'Created from save modal',
        isPrivate,
        userId,
      }).unwrap();

      refetch();
      setIsCreateBoardOpen(false);
      
      if (onSave) onSave(pinData, newBoard.id || newBoard.Id);
    } catch (err) {
      console.error('Failed to create board:', err);
      setIsCreateBoardOpen(false);
    }
  };

  if (!isOpen && !isCreateBoardOpen) return null;

  const getModalPosition = () => {
    const modalWidth = window.innerWidth <= 480 ? 280 : 320;
    const modalHeight = 400;
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (!buttonPosition) {
      const isMobile = windowWidth <= 768;
      return isMobile
        ? { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
        : { top: '120px', left: '180px', transform: 'none' };
    }

    let top = buttonPosition.top + buttonPosition.height + 8;
    let left = buttonPosition.left + buttonPosition.width / 2 - modalWidth / 2;

    if (top + modalHeight > windowHeight - 20) top = windowHeight - modalHeight - 20;
    if (left + modalWidth > windowWidth - 10) left = windowWidth - modalWidth - 10;
    if (left < 10) left = 10;

    return { top: `${top}px`, left: `${left}px` };
  };

  return (
    <>
      {isOpen && !isCreateBoardOpen && (
        <div className="save-modal-overlay">
          <div 
            ref={ref}
            className="save-modal" 
            style={getModalPosition()}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <div className="save-modal-header">
              <h3>Зберегти в...</h3>
              <button className="save-modal-close" onClick={onClose}>✕</button>
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

              {isLoading ? (
                <div className="save-loading">Завантаження дошок...</div>
              ) : (
                <div className="save-boards-list">
                  {data?.boards?.map((board) => (
                    <div 
                      key={board.id} 
                      className="save-option"
                      onClick={() => handleSaveToBoard(board.id)}
                    >
                      <div className="save-option-thumbnail">
                        {board.image ? (
                          <img src={board.image} alt={board.name} />
                        ) : (
                          <div className="save-option-placeholder">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="#ccc"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="save-option-text">
                        <span className="save-option-title">{board.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isCreateBoardOpen && (
        <CreateBoardModal
          open={isCreateBoardOpen}
          onClose={handleCloseCreateBoard}
          onCreateBoard={handleBoardCreated}
          isLoading={isCreating}
        />
      )}
    </>
  );
});

SaveToProfileModal.displayName = 'SaveToProfileModal';

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
  onMouseLeave: PropTypes.func,
};

export default SaveToProfileModal;