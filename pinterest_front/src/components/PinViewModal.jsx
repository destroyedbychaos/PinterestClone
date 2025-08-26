import React, { useState, useEffect } from 'react';
import { Box, Typography, Avatar, Button, TextField, IconButton, Menu, MenuItem } from '@mui/material';
import { Close, Favorite, FavoriteBorder, Send, MoreVert, Reply, Fullscreen } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import SideMenu from './layout/SideMenu';
import SearchHeader from './layout/SearchHeader';
import { commentsApi, pinsApi } from '../services/commentsApi';
import './PinViewModal.css';

const PinViewModal = ({ pin, isOpen, onClose, onLike, onComment, onSave }) => {
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentMenuAnchor, setCommentMenuAnchor] = useState(null);
  const [selectedCommentId, setSelectedCommentId] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (pin?.id) {
      fetchComments();
      fetchPinLikes();
    }
  }, [pin?.id]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentsApi.getComments(pin.id);
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
      const response = await pinsApi.getPinLikes(pin.id);
      setLikesCount(response.likesCount);
      setIsLiked(response.isLiked);
    } catch (error) {
      console.error('Failed to fetch pin likes:', error);
    }
  };

  if (!isOpen || !pin) return null;

  const handleLike = async () => {
    try {
      const response = await pinsApi.togglePinLike(pin.id);
      setLikesCount(response.likesCount);
      setIsLiked(response.isLiked);
      if (onLike) onLike(pin.id, response.isLiked);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async () => {
    if (comment.trim()) {
      try {
        await commentsApi.createComment(pin.id, comment.trim());
        setComment('');
        fetchComments(); 
        if (onComment) onComment(pin.id, comment.trim());
      } catch (error) {
        console.error('Failed to create comment:', error);
      }
    }
  };

  const handleSave = () => {
    if (onSave) onSave(pin.id);
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
    setCommentMenuAnchor(event.currentTarget);
    setSelectedCommentId(commentId);
  };

  const handleCommentMenuClose = () => {
    setCommentMenuAnchor(null);
    setSelectedCommentId(null);
  };

  const handleDeleteComment = async () => {
    if (selectedCommentId) {
      try {
        await commentsApi.deleteComment(selectedCommentId);
        fetchComments(); 
      } catch (error) {
        console.error('Failed to delete comment:', error);
      }
    }
    handleCommentMenuClose();
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

  const renderComment = (comment, isReply = false) => (
    <Box key={comment.id} className={isReply ? "comment-reply-item" : "comment-item"}>
      <Avatar 
        className="comment-avatar" 
        src={comment.user?.avatarUrl || "https://placehold.co/56x56"} 
      />
      <Box className="comment-content">
        <Box className="comment-header">
          <Typography className="comment-author">
            {comment.user?.displayName || comment.user?.userName || comment.user?.email}
          </Typography>
          <Typography className="comment-date">
            {formatDate(comment.createdAt)}
          </Typography>
        </Box>
        <Box className="comment-text-container">
          <Typography className="comment-text">{comment.content}</Typography>
          {comment.userId === user?.id && (
            <IconButton 
              className="comment-more"
              onClick={(e) => handleCommentMenuOpen(e, comment.id)}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );

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
                    src={pin.imageUrl || "https://placehold.co/379x642"} 
                    alt={pin.title || "Pin"} 
                  />
                  <IconButton className="fullscreen-button">
                    <Fullscreen />
                  </IconButton>
                </Box>
              </Box>

              <Box className="pin-view-info">

                <Box className="pin-info-header">
                  <Typography className="pin-title">{pin.title || "Interior design"}</Typography>
                  <Typography className="pin-description">{pin.description || "Interior design"}</Typography>
                  <Typography className="pin-tags">
                    {(() => {
                      const tagsString = typeof pin.tags === 'string' ? pin.tags : 
                                        Array.isArray(pin.tags) ? pin.tags.join(' ') : 
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
                      <Send />
                    </IconButton>
                    <IconButton className="more-button">
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
                      comments.map(comment => renderComment(comment))
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
                    <Send />
                  </Button>
                </Box>
              </Box>
            </Box>

            <Box className="related-pins-gallery">
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
              </Box>
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x267" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
              </Box>
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x558" alt="Related pin" />
              </Box>
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x558" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
              </Box>
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
              </Box>
              <Box className="gallery-column">
                <img className="gallery-image" src="https://placehold.co/267x558" alt="Related pin" />
                <img className="gallery-image" src="https://placehold.co/267x412" alt="Related pin" />
              </Box>
            </Box>
          </Box>
        </Box>

        <Menu
          anchorEl={commentMenuAnchor}
          open={Boolean(commentMenuAnchor)}
          onClose={handleCommentMenuClose}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem onClick={handleDeleteComment}>Delete Comment</MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default PinViewModal;
