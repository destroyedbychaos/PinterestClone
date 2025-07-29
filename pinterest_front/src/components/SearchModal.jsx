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
  mightLike = [],
  popular = [],
}) => {
  const modalRef = useRef();
  const [search, setSearch] = useState('');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const performSearch = (term) => {
    const trimmed = term.trim();
    if (!trimmed) {
      setPins([]);
      return;
    }

    setLoading(true);
    const url = `${API_BASE}/pins?pageNumber=1&pageSize=40&searchTerm=${encodeURIComponent(trimmed)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const foundPins = data.Pins || data.pins || [];
        setPins(foundPins);
      })
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  };

  const handleSearchClick = (term) => {
    setSearch(term);
    addRecentSearch(term);
    performSearch(term);
  };

  const addRecentSearch = (term) => {
    if (!term.trim() || recentSearches.includes(term)) return;
    setRecentSearches([term, ...recentSearches].slice(0, 10));
  };

  const removeRecentSearch = (term) => {
    setRecentSearches(recentSearches.filter((t) => t !== term));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      addRecentSearch(search.trim());
      performSearch(search);
    }
  };

  if (!open) return null;

  return (
    <Box
      ref={modalRef}
      sx={{
        position: 'fixed',
        top: 30,
        left: '50%',
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
      <form
        onSubmit={handleSubmit}
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
          <InputBase
            placeholder="Search..."
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ fontSize: '15px', color: '#1d1e1f' }}
            autoFocus
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={() => setSearch('')}>
            <CenterFocusWeakIcon sx={{ fontSize: 18, color: '#6e7b91' }} />
          </IconButton>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon sx={{ fontSize: 20, color: '#6e7b91' }} />
          </IconButton>
        </Box>
      </form>

      {!loading && pins.length === 0 && search.trim() !== '' && (
        <Typography variant="body2" color="textSecondary" align="center">
          No results found.
        </Typography>
      )}

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

      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        You might like
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
        {mightLike.map((item, index) => (
          <Box
            key={index}
            sx={{ width: 150, cursor: 'pointer' }}
            onClick={() => handleSearchClick(item.title)}
          >
            <Box
              component="img"
              src={item.img}
              alt={item.title}
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                borderRadius: '12px',
                mb: 1,
              }}
            />
            <Typography variant="body2" fontWeight={500}>
              {item.title}
            </Typography>
          </Box>
        ))}
      </Box>

      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Popular on Aestify
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {popular.map((item, index) => (
          <Box
            key={index}
            sx={{ width: 150, cursor: 'pointer' }}
            onClick={() => handleSearchClick(item.title)}
          >
            <Box
              component="img"
              src={item.img}
              alt={item.title}
              sx={{
                width: '100%',
                height: 100,
                objectFit: 'cover',
                borderRadius: '12px',
                mb: 1,
              }}
            />
            <Typography variant="body2" fontWeight={500}>
              {item.title}
            </Typography>
          </Box>
        ))}
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && pins.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Search Results
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {pins.map((pin) => (
              <Box
                key={pin.id}
                sx={{
                  p: 1,
                  borderRadius: 1,
                  border: '1px solid #ddd',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f0f0f0' },
                }}
              >
                <Typography fontWeight={500}>
                  {pin.title || pin.name || 'No title'}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default SearchModal;
