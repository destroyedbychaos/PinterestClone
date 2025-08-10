import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  InputBase,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import ClearIcon from '@mui/icons-material/Close';


const API_BASE = '/api';

const SearchModal = ({
  open,
  onClose,
  recentSearches = [],
  setRecentSearches,
  onSearchResults,
  showImageSearch,
  setShowImageSearch,
}) => {
  const modalRef = useRef();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  
  useEffect(() => {
    if (open) {
      fetchRecommendations();
    }
  }, [open]);

  const fetchRecommendations = async () => {
    try {
      const res = await fetch(`${API_BASE}/Pins/recommendations`);
      const data = await res.json();
      if (data?.mightLike || data?.popular) {
        setRecommendations([...data.mightLike || [], ...data.popular || []].slice(0, 8));
      } else if (Array.isArray(data)) {
        setRecommendations(data.slice(0, 8));
      } else {
        setRecommendations([]);
      }
    } catch {
      setRecommendations([]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, onClose]);

  const handleSearch = async (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/Pins?pageNumber=1&pageSize=40&searchTerm=${encodeURIComponent(trimmed)}`
      );
      const data = await res.json();
      const foundPins = data.Pins || data.pins || [];

      if (!recentSearches.includes(trimmed)) {
        setRecentSearches([trimmed, ...recentSearches].slice(0, 10));
      }

      onSearchResults?.(foundPins);
      onClose();
    } catch {
      onSearchResults?.([]);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(search);
  };

  const handleSearchClick = (term) => {
    setSearch(term);
    handleSearch(term);
  };

  const removeRecentSearch = (term) => {
    setRecentSearches(recentSearches.filter((t) => t !== term));
  };

  const handleClearSearch = () => {
    setSearch('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <>
      {open && (
        <Box
          ref={modalRef}
          sx={{
            position: 'fixed',
            top: 30,
            left: '53%',
            transform: 'translateX(-50%)',
            width: '95%',
            maxWidth: 730,
            bgcolor: '#fff',
            borderRadius: '24px',
            p: 3,
            boxShadow: 12,
            zIndex: 1300,
            overflowY: 'auto',
            maxHeight: '90vh',
          }}
        >
             <Box
         style={{
           display: 'flex',
           alignItems: 'center',
           justifyContent: 'space-between',
           padding: '0 16px',
           height: 44,
           borderRadius: 999,
           backgroundColor: '#f4f7fd',
           boxShadow: 'inset 0 0 0 1px #d3dce6',
           marginBottom: 24,
           width: '100%',
         }}
       >
         <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
           <SearchIcon sx={{ color: '#6e7b91', fontSize: 20, mr: 1 }} />
           <form onSubmit={handleSubmit} style={{ flex: 1 }}>
             <InputBase
               placeholder="Search... (Press Esc to clear)"
               fullWidth
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               onKeyDown={handleKeyDown}
               sx={{ fontSize: '15px', color: '#1d1e1f' }}
               autoFocus
             />
           </form>
         </Box>
         <Box sx={{ display: 'flex', gap: 1 }}>
           <IconButton size="small" onClick={onClose}>
             <CloseIcon sx={{ fontSize: 20, color: '#6e7b91' }} />
           </IconButton>
         </Box>
       </Box>

       

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && (
        <>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Recent searches
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
            {recentSearches.map((text, index) => (
              <Box
                key={index}
                sx={{
                  px: 2,
                  py: 1,
                  borderRadius: '20px',
                  backgroundColor: '#eaf0fa',
                  color: '#111',
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
                onClick={() => handleSearchClick(text)}
              >
                {text}
                <ClearIcon
                  sx={{ ml: 1, fontSize: 16, cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecentSearch(text);
                  }}
                />
              </Box>
            ))}
          </Box>

          {recommendations.length > 0 && (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                You might like
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                {recommendations.slice(0, 4).map((item, index) => (
                  <Box
                    key={index}
                    sx={{ width: 150, cursor: 'pointer' }}
                    onClick={() => handleSearchClick(item.title || item.name)}
                  >
                    <Box
                      component="img"
                      src={item.imageUrl || item.ImageUrl || item.image}
                      alt={item.title || item.name}
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: '12px',
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {item.title || item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Typography variant="subtitle1" fontWeight={600} mb={1}>
                Popular on Aestify
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {recommendations.slice(4, 8).map((item, index) => (
                  <Box
                    key={index}
                    sx={{ width: 150, cursor: 'pointer' }}
                    onClick={() => handleSearchClick(item.title || item.name)}
                  >
                    <Box
                      component="img"
                      src={item.imageUrl || item.ImageUrl || item.image}
                      alt={item.title || item.name}
                      sx={{
                        width: '100%',
                        height: 100,
                        objectFit: 'cover',
                        borderRadius: '12px',
                        mb: 1,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {item.title || item.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </>
      )}
      </Box>
      )}


    </>
  );
};

export default SearchModal;
