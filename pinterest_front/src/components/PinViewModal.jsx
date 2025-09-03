import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import { Close, Favorite, FavoriteBorder, MoreVert, Reply, Fullscreen } from '@mui/icons-material';
import SendIcon from './ui/icons/SendIcon';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SideMenu from './layout/SideMenu';
import SearchHeader from './layout/SearchHeader';
import { commentsApi, pinsApi } from '../services/commentsApi';
import historyApiService from '../services/historyApi';
import SimilarPinsGallery from './ui/SimilarPinsGallery';
import ReportModal from './ui/ReportModal';
import FullscreenPinModal from './ui/FullscreenPinModal';
import PinOptionsModal from './ui/PinOptionsModal';
import SharePinModal from './ui/SharePinModal';
import './PinViewModal.css';

const PinViewModal = ({ pin, isOpen, onClose, onLike, onComment, onSave, source = 'home' }) => {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const [commentModalOpen, setCommentModalOpen] = useState(false);
  const [commentModalPosition, setCommentModalPosition] = useState({ x: 0, y: 0 });
  const [commentReportModalOpen, setCommentReportModalOpen] = useState(false);
  const [selectedCommentForReport, setSelectedCommentForReport] = useState(null);
  const [currentPin, setCurrentPin] = useState(pin);
  const [blockedUsers, setBlockedUsers] = useState(() => {
    const saved = localStorage.getItem('blockedUsers');
    return saved ? JSON.parse(saved) : [];
  });
  const [fullscreenModalOpen, setFullscreenModalOpen] = useState(false);
  const [pinOptionsModalOpen, setPinOptionsModalOpen] = useState(false);
  const [pinOptionsPosition, setPinOptionsPosition] = useState({ x: 0, y: 0 });
  const [sharePinModalOpen, setSharePinModalOpen] = useState(false);
  const [pinReportModalOpen, setPinReportModalOpen] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPin(pin);
  }, [pin]);

  useEffect(() => {
    console.log('🔍 PinViewModal useEffect - currentPin:', currentPin);
    if (currentPin?.id) {
      console.log('✅ Pin має ID:', currentPin.id);
      fetchComments();
      fetchPinLikes();

      addPinToHistory();
    } else {
      console.log('❌ Pin не має ID або pin не передано');
    }
  }, [currentPin?.id]);

  const addPinToHistory = async () => {
    if (currentPin?.id && source !== 'history') {

      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ Користувач не авторизований, історія не зберігається');
        return;
      }
      
      try {
        console.log('🔄 Додаю пін в історію:', currentPin.id, 'source:', source);
        const result = await historyApiService.addPinView(currentPin.id, source, null, true);
        
        if (result.message === "Pin already in history, skipping") {
          console.log('⏭️ Пін вже є в історії, пропускаємо');
        } else {
          console.log('✅ Пін додано в історію:', result);
        }
      } catch (error) {
        console.error('❌ Помилка додавання піна в історію:', error);
      }
    } else {
      console.log('⏭️ Пін не додається в історію (source === history або немає currentPin.id)');
    }
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getComments(currentPin.id);
      console.log('Fetched comments response:', response);
      if (response && response.length > 0) {
        console.log('First comment structure:', response[0]);
        console.log('First comment user data:', response[0].user);
        console.log('First comment user email:', response[0].user?.email);
        console.log('First comment user ID:', response[0].user?.id);
        console.log('First comment userName:', response[0].user?.userName);
        console.log('First comment userId:', response[0].userId);
      }
      setComments(response || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchPinLikes = async () => {
    try {
      const response = await pinsApi.getPinLikes(currentPin.id);
      setLikesCount(response.likesCount);
      setIsLiked(response.isLiked);
    } catch (error) {
      console.error('Failed to fetch pin likes:', error);
    }
  };

  if (!isOpen || !currentPin) return null;

  const handleLike = async () => {
    try {
      const response = await pinsApi.togglePinLike(currentPin.id);
      setLikesCount(response.likesCount);
      setIsLiked(response.isLiked);
      if (onLike) onLike(currentPin.id, response.isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async () => {
    if (comment.trim()) {
      try {
        await commentsApi.createComment(currentPin.id, comment.trim());
        setComment('');
        fetchComments(); 
        if (onComment) onComment(currentPin.id, comment.trim());
      } catch (error) {
        console.error('Failed to create comment:', error);
      }
    }
  };

  const handleSave = () => {
    if (onSave) onSave(currentPin.id);
  };

  const handleBackToHome = () => {
    navigate('/');
    onClose();
  };

  const handleSearch = (searchTerm) => {
    console.log('Search:', searchTerm);
  };

  const handleFocusSearch = () => {
    console.log('Focus search');
  };

  const handleCommentMenuOpen = (event, commentId) => {
    console.log('Opening comment modal for comment:', commentId);
    console.log('Current state - commentModalOpen:', commentModalOpen, 'selectedCommentId:', selectedCommentId);
    

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom + 10; 
    

    const modalWidth = 200; 
    const modalHeight = 150; 
    

    if (x + modalWidth > window.innerWidth) {
      x = window.innerWidth - modalWidth - 20;
    }
    

    if (y + modalHeight > window.innerHeight) {
      y = rect.top - modalHeight - 10;
    }
    
   
    if (x < 20) {
      x = 20;
    }
    
    setCommentModalPosition({ x, y });
    setSelectedCommentId(commentId);
    setCommentModalOpen(true);
    console.log('State updated - commentModalOpen: true, selectedCommentId:', commentId, 'Position:', { x, y });
  };

  const handleCommentMenuClose = () => {
    setSelectedCommentId(null);
    setCommentModalOpen(false);
  };

  const handleDeleteComment = async () => {
    console.log('Deleting comment:', selectedCommentId);
    if (selectedCommentId) {
      try {
        await commentsApi.deleteComment(selectedCommentId);
        console.log('Comment deleted successfully');
        fetchComments(); 
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
    console.log('Closing comment modal after delete');
    setCommentModalOpen(false);
    setSelectedCommentId(null);
  };

  const handleCommentReport = (comment) => {
    console.log('Opening comment report modal for comment:', comment);
    setSelectedCommentForReport(comment);
    setCommentReportModalOpen(true);
    setCommentModalOpen(false); 
  };

  const handleCommentReportSubmit = async (commentId, reportMessage) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Необхідно авторизуватися');
      }

      console.log('Sending comment report with commentId:', commentId, 'reportMessage:', reportMessage);

  
      const requestBody = {
        CommentId: commentId,
        ReportMessage: reportMessage
      };
      console.log('Request body:', requestBody);


      console.log('Comment report submitted:', { commentId, reportMessage });
      

       setCommentReportModalOpen(false);
       setSelectedCommentForReport(null);
    } catch (error) {
      console.error('Error reporting comment:', error);
      alert(error.message || 'Помилка відправки скарги');
    }
  };

  const handleBlockUser = (commentToBlock) => {
    if (!commentToBlock?.user?.id) {
      console.log('Cannot block user: no user ID found');
      return;
    }

    const userIdToBlock = commentToBlock.user.id;
    console.log('Blocking user:', userIdToBlock);


    const newBlockedUsers = [...blockedUsers, userIdToBlock];
    setBlockedUsers(newBlockedUsers);

    localStorage.setItem('blockedUsers', JSON.stringify(newBlockedUsers));

    setCommentModalOpen(false);
    
    console.log('User blocked successfully. Blocked users:', newBlockedUsers);
  };

  const handleZoomIn = () => {
    console.log('Zoom in clicked');

  };

  const handleZoomOut = () => {
    console.log('Zoom out clicked');
    
  };


  const handlePinEdit = () => {
    console.log('Edit pin clicked');
    setPinOptionsModalOpen(false);

  };

  const handlePinDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = currentPin.imageUrl || "https://placehold.co/379x642";
      link.download = `${currentPin.title || 'pin'}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      

      console.log('Зображення завантажується...');
    } catch (error) {
      console.error('Error downloading image:', error);
    }
    setPinOptionsModalOpen(false);
  };

  const handlePinShare = () => {
    setPinOptionsModalOpen(false);
    setSharePinModalOpen(true);
  };

  const handlePinHide = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('Необхідно авторизуватися для приховування піна');
        return;
      }

      console.log('Hiding pin with pinId:', currentPin.id || currentPin.Id);
      
      const response = await fetch('/api/HiddenPins/hide', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentPin.id || currentPin.Id)
      });

      if (response.ok) {
        console.log('Пін успішно приховано');

        onClose();
      } else {
        const responseData = await response.json();
        if (responseData.message === "Pin is already hidden for this user") {
          console.log('Цей пін вже прихований');
        } else {
          console.error('Error hiding pin');
        }
      }
    } catch (error) {
      console.error('Error hiding pin:', error);
    }
    
    setPinOptionsModalOpen(false);
  };

  const handlePinReport = () => {
    setPinOptionsModalOpen(false);
    setPinReportModalOpen(true);
  };

  const handlePinShareSuccess = (selectedUser, message) => {
    console.log('Pin shared successfully with:', selectedUser, 'Message:', message);

  };

  const handlePinOptionsOpen = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.left;
    let y = rect.bottom + 10; 
    

    const modalWidth = 180; 
    const modalHeight = 200; 
    

    if (x + modalWidth > window.innerWidth) {
      x = window.innerWidth - modalWidth - 20;
    }
    
    if (y + modalHeight > window.innerHeight) {
      y = rect.top - modalHeight - 10; 
    }
    

    if (x < 20) {
      x = 20;
    }
    
    setPinOptionsPosition({ x, y });
    setPinOptionsModalOpen(true);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    
    return date.toLocaleDateString();
  };

  const renderComment = (comment, isReply = false) => {
    console.log('Rendering comment:', comment);
    console.log('Comment user:', comment.user);
    console.log('User email:', comment.user?.email);
    console.log('User ID:', comment.user?.id);
    console.log('User userName:', comment.user?.userName);
    
    return (
      <Box key={comment.id} className={isReply ? "comment-reply-item" : "comment-item"}>
        <Avatar 
          className="comment-avatar clickable-avatar" 
          src={comment.user?.avatarUrl || "https://placehold.co/56x56"} 
          onClick={() => {
            console.log('Avatar clicked for comment:', comment);
            console.log('Comment user data:', comment.user);
            console.log('User email:', comment.user?.email);
            console.log('User ID:', comment.user?.id);
            console.log('User userName:', comment.user?.userName);
            console.log('Comment userId:', comment.userId);
            
            if (comment.user?.userName) {
              console.log('Navigating to user profile via userName:', comment.user.userName);
              navigate(`/user/${comment.user.userName}`);
              onClose(); 
            } else if (comment.user?.email) {
              console.log('Navigating to user profile via email:', comment.user.email);
              navigate(`/user/${comment.user.email}`);
              onClose(); 
            } else if (comment.userId) {
              console.log('Navigating to user profile via userId:', comment.userId);
              navigate(`/user/${comment.userId}`);
              onClose(); 
            } else {
              console.log('No userName, email or userId found, cannot navigate');
            }
          }}
          sx={{ cursor: 'pointer' }}
        />
      <Box className="comment-content">
        <Box className="comment-header">
          <Typography 
            className="comment-author clickable-author"
                                     onClick={() => {
              console.log('Name clicked for comment:', comment);
              console.log('Comment user data:', comment.user);
              console.log('User email:', comment.user?.email);
              console.log('User userName:', comment.user?.userName);
              console.log('Comment userId:', comment.userId);
              
              if (comment.user?.userName) {
                console.log('Navigating to user profile via name and userName:', comment.user.userName);
                navigate(`/user/${comment.user.userName}`);
                onClose(); 
              } else if (comment.user?.email) {
                console.log('Navigating to user profile via name and email:', comment.user.email);
                navigate(`/user/${comment.user.email}`);
                onClose(); 
              } else if (comment.userId) {
                console.log('Navigating to user profile via name and userId:', comment.userId);
                navigate(`/user/${comment.userId}`);
                onClose();
              } else {
                console.log('No userName, email or userId found, cannot navigate');
              }
            }}
            sx={{ cursor: 'pointer' }}
          >
            {comment.user?.displayName || comment.user?.userName || comment.user?.email}
          </Typography>
          <Typography className="comment-date">
            {formatDate(comment.createdAt)}
          </Typography>
        </Box>
        <Box className="comment-text-container">
          <Typography className="comment-text">{comment.content}</Typography>
          <IconButton 
            className="comment-more"
            onClick={(e) => {
              console.log('Comment menu clicked for comment:', comment.id, 'User ID:', comment.userId, 'Current user ID:', user?.id);
              handleCommentMenuOpen(e, comment.id);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
      </Box>
    </Box>
    );
  };

  return (
    <Box className="pin-view-modal-overlay" onClick={onClose}>
      <Box className="pin-view-modal-content" onClick={(e) => e.stopPropagation()}>

        <SideMenu />

        <Box className="pin-view-main-content">

          <Box sx={{
            position: 'absolute',
            top: '48px',
            left: '40px',
            zIndex: 20
          }}>
            <IconButton
              onClick={handleBackToHome}
              sx={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <svg
                width="34"
                height="27"
                viewBox="0 0 36 29"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.5606 28.0601C15.2794 28.341 14.8981 28.4988 14.5006 28.4988C14.1031 28.4988 13.7219 28.341 13.4406 28.0601L0.940633 15.5601C0.659732 15.2789 0.501953 14.8976 0.501953 14.5001C0.501953 14.1026 0.659732 13.7214 0.940633 13.4401L13.4406 0.940116C13.624 0.742667 13.8572 0.598324 14.1157 0.522296C14.3742 0.446268 14.6484 0.441368 14.9094 0.508115C15.1705 0.574861 15.4087 0.710783 15.599 0.901557C15.7893 1.09233 15.9246 1.3309 15.9906 1.59212C16.0572 1.85288 16.0525 2.12676 15.9768 2.38505C15.9012 2.64333 15.7574 2.87651 15.5606 3.06012L5.62063 13.0001H34.5006C34.8985 13.0001 35.28 13.1582 35.5613 13.4395C35.8426 13.7208 36.0006 14.1023 36.0006 14.5001C36.0006 14.8979 35.8426 15.2795 35.5613 15.5608C35.28 15.8421 34.8985 16.0001 34.5006 16.0001H5.62063L15.5606 25.9401C15.8415 26.2214 15.9993 26.6026 15.9993 27.0001C15.9993 27.3976 15.8415 27.7789 15.5606 28.0601Z"
                  fill="#01233F"
                />
              </svg>
            </IconButton>
          </Box>

          <SearchHeader
            user={user}
            onSearch={handleSearch}
            onFocusSearch={handleFocusSearch}
            title="Aest"
          />

          <Box className="pin-view-content-container">

            <Box className="pin-view-main">

              <Box className="pin-view-image-container">
                <Box className="pin-view-image-wrapper">
                  <img 
                    className="pin-view-image" 
                    src={currentPin.imageUrl || "https://placehold.co/379x642"} 
                    alt={currentPin.title || "Pin"} 
                  />
                                                         <IconButton 
                      className="fullscreen-button"
                      onClick={() => setFullscreenModalOpen(true)}
                    >
                      <Fullscreen />
                    </IconButton>
                </Box>
              </Box>

              <Box className="pin-view-info">

                <Box className="pin-info-header">
                  <Typography className="pin-title">{currentPin.title || "Interior design"}</Typography>
                  <Typography className="pin-description">{currentPin.description || "Interior design"}</Typography>
                  <Typography className="pin-tags">
                    {(() => {
                      const tagsString = typeof currentPin.tags === 'string' ? currentPin.tags : 
                                        Array.isArray(currentPin.tags) ? currentPin.tags.join(' ') : 
                                        "interior design";
                      return tagsString
                        .split(/[,\s]+/)
                        .filter(tag => tag.trim())
                        .map(tag => `#${tag.trim()}`)
                        .join(' ');
                    })()}
                  </Typography>
                </Box>

                <Box className="pin-actions">
                  <Box className="pin-actions-left">
                    <Button className="like-button" onClick={handleLike}>
                      {isLiked ? <Favorite className="liked-icon" /> : <FavoriteBorder />}
                      <Typography className="like-count">{likesCount}</Typography>
                    </Button>
                    <IconButton className="share-button">
                      <SendIcon size={20} />
                    </IconButton>
                                         <IconButton 
                       className="more-button"
                       onClick={handlePinOptionsOpen}
                     >
                       <MoreVert />
                     </IconButton>
                  </Box>
                </Box>

                <Box className="pin-divider" />

                <Box className="comments-section">
                  <Box className="comments-list">
                    {loading ? (
                      <Typography>Loading comments...</Typography>
                                         ) : comments.length === 0 ? (
                       <Typography>No comments yet. Be the first to comment!</Typography>
                     ) : (
                       (() => {
                         const filteredComments = comments.filter(comment => !blockedUsers.includes(comment.user?.id));
                         console.log('Total comments:', comments.length);
                         console.log('Blocked users:', blockedUsers);
                         console.log('Filtered comments:', filteredComments.length);
                         return filteredComments.map(comment => renderComment(comment));
                       })()
                     )}
                  </Box>
                </Box>

                <Box className="comment-input-section">
                  <TextField
                    className="comment-input"
                    placeholder="Add a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                    multiline
                    maxRows={3}
                  />
                  <Button 
                    className="send-button"
                    onClick={handleComment}
                    disabled={!comment.trim()}
                  >
                    <SendIcon size={20} />
                  </Button>
                </Box>
              </Box>
            </Box>

            <SimilarPinsGallery 
              pinId={currentPin?.id || currentPin?.Id} 
              onPinClick={(similarPin) => {
                const newPin = {
                  id: similarPin.Id || similarPin.id,
                  imageUrl: similarPin.ImageUrl || similarPin.imageUrl || similarPin.image,
                  title: similarPin.Title || similarPin.title,
                  description: similarPin.Description || similarPin.description,
                  author: similarPin.UserName || similarPin.userName,
                  tags: similarPin.Tags || similarPin.tags
                };
                console.log('Switching to similar pin:', newPin);
                
                setComments([]);
                setLikesCount(0);
                setIsLiked(false);
                setComment('');
                

                setCurrentPin(newPin);
              }}
            />
          </Box>
        </Box>

        {commentModalOpen && (
          <Box className="comment-modal-overlay" onClick={() => {
            console.log('Closing comment modal via overlay click');
            setCommentModalOpen(false);
          }}>
            <Box 
              className="comment-modal-content" 
              onClick={(e) => e.stopPropagation()}
              sx={{
                position: 'fixed',
                left: commentModalPosition.x,
                top: commentModalPosition.y,
                zIndex: 10001
              }}
            >
                                                              <Box className="comment-modal-menu">

                   {selectedCommentId && comments.find(c => c.id === selectedCommentId)?.userId === user?.id && (
                     <Button 
                       className="comment-modal-option delete-option"
                       onClick={handleDeleteComment}
                     >
                       <Box className="comment-modal-icon">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                           <path d="M10.6654 1.16667V2H14.1654C14.298 2 14.4252 2.05268 14.5189 2.14645C14.6127 2.24021 14.6654 2.36739 14.6654 2.5C14.6654 2.63261 14.6127 2.75979 14.5189 2.85355C14.4252 2.94732 14.298 3 14.1654 3H1.83203C1.69942 3 1.57225 2.94732 1.47848 2.85355C1.38471 2.75979 1.33203 2.63261 1.33203 2.5C1.33203 2.36739 1.38471 2.24021 1.47848 2.14645C1.57225 2.05268 1.69942 2 1.83203 2H5.33203V1.16667C5.33203 0.522667 5.8547 0 6.4987 0H9.4987C10.1427 0 10.6654 0.522667 10.6654 1.16667ZM6.33203 1.16667V2H9.66537V1.16667C9.66537 1.12246 9.64781 1.08007 9.61655 1.04882C9.58529 1.01756 9.5429 1 9.4987 1H6.4987C6.4545 1 6.4121 1.01756 6.38085 1.04882C6.34959 1.08007 6.33203 1.12246 6.33203 1.16667ZM3.33003 4.11867C3.32433 4.05284 3.30564 3.9888 3.27504 3.93024C3.24444 3.87168 3.20254 3.81977 3.15176 3.7775C3.10097 3.73523 3.04231 3.70345 2.97917 3.68398C2.91603 3.66452 2.84966 3.65777 2.78389 3.66411C2.71813 3.67045 2.65427 3.68977 2.59601 3.72094C2.53775 3.75211 2.48625 3.79452 2.44448 3.84571C2.40271 3.89691 2.37151 3.95587 2.35266 4.0192C2.33382 4.08253 2.32771 4.14896 2.3347 4.21467L3.27603 13.9467C3.30419 14.2351 3.4387 14.5028 3.65338 14.6975C3.86806 14.8922 4.14753 15 4.43736 15H11.56C11.85 15 12.1295 14.8921 12.3442 14.6972C12.5589 14.5024 12.6934 14.2346 12.7214 13.946L13.6634 4.21467C13.6761 4.08259 13.6358 3.95086 13.5514 3.84847C13.4671 3.74607 13.3454 3.6814 13.2134 3.66867C13.0813 3.65594 12.9496 3.69619 12.8472 3.78059C12.7448 3.86498 12.6801 3.98659 12.6674 4.11867L11.726 13.8493C11.7221 13.8906 11.7028 13.9289 11.6721 13.9567C11.6415 13.9846 11.6015 14 11.56 14H4.43736C4.39591 14 4.35594 13.9846 4.32525 13.9567C4.29455 13.9289 4.27534 13.8906 4.27136 13.8493L3.33003 4.11867Z" fill="#01233F"/>
                           <path d="M6.1356 5.00071C6.20118 4.99683 6.26688 5.00591 6.32895 5.02744C6.39101 5.04896 6.44823 5.08251 6.49733 5.12616C6.54642 5.1698 6.58644 5.2227 6.61508 5.28182C6.64373 5.34094 6.66044 5.40512 6.66427 5.47071L6.9976 11.1374C7.00538 11.2699 6.9602 11.4001 6.87199 11.4993C6.78379 11.5985 6.65979 11.6586 6.52727 11.6664C6.39475 11.6742 6.26457 11.629 6.16536 11.5408C6.06615 11.4526 6.00605 11.3286 5.99827 11.196L5.66493 5.52937C5.66106 5.46379 5.67014 5.39809 5.69166 5.33603C5.71319 5.27396 5.74674 5.21674 5.79038 5.16765C5.83403 5.11855 5.88693 5.07854 5.94605 5.04989C6.00517 5.02125 6.06935 5.00453 6.13493 5.00071H6.1356ZM10.3309 5.52937C10.3387 5.39685 10.2935 5.26667 10.2053 5.16746C10.1171 5.06826 9.99312 5.00815 9.8606 5.00037C9.72808 4.99259 9.5979 5.03778 9.49869 5.12598C9.39949 5.21418 9.33938 5.33819 9.3316 5.47071L8.99827 11.1374C8.99049 11.2698 9.03563 11.3999 9.12378 11.499C9.21192 11.5982 9.33584 11.6583 9.46827 11.666C9.6007 11.6738 9.7308 11.6287 9.82994 11.5405C9.92909 11.4524 9.98915 11.3285 9.99693 11.196L10.3309 5.52937Z" fill="#01233F"/>
                         </svg>
                       </Box>
                       <Typography className="comment-modal-text">Delete</Typography>
                     </Button>
                   )}
  
                   {selectedCommentId && comments.find(c => c.id === selectedCommentId)?.userId !== user?.id && (
                     <Button 
                       className="comment-modal-option block-option"
                       onClick={() => {
                         const commentToBlock = comments.find(c => c.id === selectedCommentId);
                         if (commentToBlock) {
                           handleBlockUser(commentToBlock);
                         }
                       }}
                     >
                    <Box className="comment-modal-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8.0013 0.666504C12.0513 0.666504 15.3346 3.94984 15.3346 7.99984C15.3346 12.0498 12.0513 15.3332 8.0013 15.3332C3.9513 15.3332 0.667969 12.0498 0.667969 7.99984C0.667969 3.94984 3.9513 0.666504 8.0013 0.666504ZM3.89064 12.8178C5.03575 13.7979 6.49402 14.3355 8.0013 14.3332C9.68101 14.3332 11.2919 13.6659 12.4796 12.4782C13.6674 11.2904 14.3346 9.67954 14.3346 7.99984C14.337 6.49256 13.7994 5.03429 12.8193 3.88917L3.89064 12.8178ZM1.66797 7.99984C1.66563 9.50711 2.2032 10.9654 3.1833 12.1105L12.112 3.18184C10.9669 2.20173 9.50858 1.66417 8.0013 1.6665C6.3216 1.6665 4.71069 2.33376 3.52296 3.52149C2.33523 4.70922 1.66797 6.32013 1.66797 7.99984Z" fill="#01233F"/>
                      </svg>
                    </Box>
                                           <Typography className="comment-modal-text">Block user</Typography>
                     </Button>
                   )}
                   

                   <Button 
                     className="comment-modal-option report-option"
                     onClick={() => {
                       const comment = comments.find(c => c.id === selectedCommentId);
                       if (comment) {
                         handleCommentReport(comment);
                       }
                     }}
                   >
                    <Box className="comment-modal-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 2.83317C1 2.18917 1.52267 1.6665 2.16667 1.6665H13.8333C14.4773 1.6665 15 2.18917 15 2.83317V11.1665C15 11.4759 14.8771 11.7727 14.6583 11.9915C14.4395 12.2103 14.1428 12.3332 13.8333 12.3332H7.44267C7.42076 12.3331 7.39907 12.3374 7.37882 12.3458C7.35858 12.3541 7.34017 12.3664 7.32467 12.3818L4.99133 14.7152C4.85537 14.8506 4.68235 14.9428 4.49408 14.9801C4.30581 15.0173 4.11072 14.998 3.93341 14.9246C3.75609 14.8512 3.60449 14.7269 3.4977 14.5674C3.39091 14.4079 3.33372 14.2204 3.33333 14.0285V12.3332H2.16667C1.85725 12.3332 1.5605 12.2103 1.34171 11.9915C1.12292 11.7727 1 11.4759 1 11.1665V2.83317ZM2.16667 2.6665C2.12246 2.6665 2.08007 2.68406 2.04882 2.71532C2.01756 2.74658 2 2.78897 2 2.83317V11.1665C2 11.2585 2.07467 11.3332 2.16667 11.3332H3.83333C3.96594 11.3332 4.09312 11.3858 4.18689 11.4796C4.28066 11.5734 4.33333 11.7006 4.33333 11.8332V13.9598L6.618 11.6752C6.83667 11.4563 7.13331 11.3333 7.44267 11.3332H13.8333C13.8775 11.3332 13.9199 11.3156 13.9512 11.2844C13.9824 11.2531 14 11.2107 14 11.1665V2.83317C14 2.78897 13.9824 2.74658 13.9512 2.71532C13.9199 2.68406 13.8775 2.6665 13.8333 2.6665H2.16667ZM8 3.99984C8.13261 3.99984 8.25979 4.05252 8.35355 4.14628C8.44732 4.24005 8.5 4.36723 8.5 4.49984V7.1665C8.5 7.29911 8.44732 7.42629 8.35355 7.52006C8.25979 7.61382 8.13261 7.6665 8 7.6665C7.86739 7.6665 7.74022 7.61382 7.64645 7.52006C7.55268 7.42629 7.5 7.29911 7.5 7.1665V4.49984C7.5 4.36723 7.55268 4.24005 7.64645 4.14628C7.74022 4.05252 7.86739 3.99984 8 3.99984ZM8 9.99984C7.82319 9.99984 7.65362 9.9296 7.5286 9.80457C7.40357 9.67955 7.33333 9.50998 7.33333 9.33317C7.33333 9.15636 7.40357 8.98679 7.5286 8.86177C7.65362 8.73674 7.82319 8.6665 8 8.6665C8.17681 8.6665 8.34638 8.73674 8.4714 8.86177C8.59643 8.98679 8.66667 9.15636 8.66667 9.33317C8.66667 9.50998 8.59643 9.67955 8.4714 9.80457C8.34638 9.9296 8.17681 9.99984 8 9.99984Z" fill="#01233F"/>
                      </svg>
                    </Box>
                    <Typography className="comment-modal-text">Report</Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          )}


          <ReportModal
            isOpen={commentReportModalOpen}
            onClose={() => {
              setCommentReportModalOpen(false);
              setSelectedCommentForReport(null);
            }}
            onSubmit={handleCommentReportSubmit}
            pinId={selectedCommentForReport?.id}
            pinTitle={`Коментар від ${selectedCommentForReport?.user?.displayName || selectedCommentForReport?.user?.userName || selectedCommentForReport?.user?.email || 'користувача'}`}
            type="comment"
          />


          <FullscreenPinModal
            pin={currentPin}
            isOpen={fullscreenModalOpen}
            onClose={() => setFullscreenModalOpen(false)}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
          />


            <PinOptionsModal
              isOpen={pinOptionsModalOpen}
              onClose={() => setPinOptionsModalOpen(false)}
              onEdit={handlePinEdit}
              onDownload={handlePinDownload}
              onShare={handlePinShare}
              onHide={handlePinHide}
              onReport={handlePinReport}
              pin={currentPin}
              position={pinOptionsPosition}
            />


          <SharePinModal
            isOpen={sharePinModalOpen}
            onClose={() => setSharePinModalOpen(false)}
            onShare={handlePinShareSuccess}
            pin={currentPin}
          />


          <ReportModal
            isOpen={pinReportModalOpen}
            onClose={() => setPinReportModalOpen(false)}
            onSubmit={async (pinId, reportMessage) => {
              try {
                const token = localStorage.getItem('token');
                if (!token) {
                  throw new Error('Необхідно авторизуватися');
                }

                const requestBody = {
                  PinId: currentPin.id || currentPin.Id,
                  ReportMessage: reportMessage
                };

                const response = await fetch('/api/PinReports/report', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                  console.log('Pin report submitted successfully');
                  setPinReportModalOpen(false);
                } else {
                  const errorData = await response.json();
                  console.error('Error submitting pin report:', errorData);
                }
              } catch (error) {
                console.error('Error reporting pin:', error);
              }
            }}
            pinId={currentPin?.id || currentPin?.Id}
            pinTitle={currentPin?.title || 'Pin'}
            type="pin"
          />
        </Box>
      </Box>
    );
  };

export default PinViewModal;
