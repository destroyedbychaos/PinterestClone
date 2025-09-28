import React, { useRef, useEffect, useState } from 'react';
import { Box, Typography, IconButton, InputBase, CircularProgress } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import ClearIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';
import { apiUrl } from '../env';

const API_BASE = apiUrl;
const token = localStorage.getItem("token");

const highlightMatch = (text, query) => {
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <strong key={i} style={{ fontWeight: 700 }}>{part}</strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
};

const SearchModal = ({
  open,
  onClose,
  recentSearches = [],
  setRecentSearches,
  showImageSearch,
  setShowImageSearch,
}) => {
  const modalRef = useRef();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) fetchRecommendations();
    else {
      setSearch('');
      setSuggestions([]);
    }
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  useEffect(() => {
    if (search.trim()) fetchSuggestions(search);
    else setSuggestions([]);
  }, [search]);

  const fetchRecommendations = async () => {
    try {

      const res = await fetch(`${API_BASE}/Pins/recommendations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      const data = await res.json();
      if (data?.mightLike || data?.popular) {
        setRecommendations([...data.mightLike || [], ...data.popular || []].slice(0, 8));
      } else if (Array.isArray(data)) setRecommendations(data.slice(0, 8));
      else setRecommendations([]);
    } catch { setRecommendations([]); }
  };

  const fetchSuggestions = async (term) => {
    try {
      const res = await fetch(`${API_BASE}/pins/search-suggestions?q=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data || []);
      } else setSuggestions([]);
    } catch { setSuggestions([]); }
  };

  const handleSearchRedirect = (term) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    if (!recentSearches.includes(trimmed)) {
      setRecentSearches([trimmed, ...recentSearches].slice(0, 10));
    }

    navigate(`/search-filter?query=${encodeURIComponent(trimmed)}`);
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearchRedirect(search);
  };

  const handleSearchClick = (term) => handleSearchRedirect(term);
  const removeRecentSearch = (term) => setRecentSearches(recentSearches.filter((t) => t !== term));
  const handleClearSearch = () => setSearch('');
  const handleKeyDown = (e) => { if (e.key === 'Escape') handleClearSearch(); };

  return (
    <>
      {open && (
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
          <Box style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 16px', height: 44, borderRadius: 999, backgroundColor: '#f4f7fd',
            boxShadow: 'inset 0 0 0 1px #d3dce6', marginBottom: 24, width: '100%',
          }}>
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

          {!loading && search.trim() ? (
            <Box sx={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {suggestions.length > 0 ? (
                suggestions.map((s, idx) => (
                  <Box
                    key={idx}
                    onClick={() => handleSearchClick(s)}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.6,
                      cursor: 'pointer', bgcolor: 'background.paper',
                      '&:hover': { bgcolor: '#e8f0fe' },
                      borderRadius: '17px',
                    }}
                  >
                    <SearchIcon sx={{ color: '#6e7b91', fontSize: 20 }} />
                    <Typography sx={{ fontSize: 15, color: '#1d1e1f' }}>
                      {highlightMatch(s, search)}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography sx={{ p: 2, color: '#6e7b91', fontStyle: 'italic', fontSize: 14 }}>
                  No suggestions
                </Typography>
              )}
            </Box>
          ) : (
            <>
              <Typography variant="subtitle1" fontWeight={600} mb={1}>Recent searches</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 3 }}>
                {recentSearches.map((text, index) => (
                  <Box
                    key={index}
                    sx={{
                      px: 2, py: 1, borderRadius: '20px', backgroundColor: '#eaf0fa',
                      color: '#111', display: 'flex', alignItems: 'center',
                      fontSize: 14, fontWeight: 500, cursor: 'pointer',
                    }}
                    onClick={() => handleSearchClick(text)}
                  >
                    {text}
                    <ClearIcon
                      sx={{ ml: 1, fontSize: 16, cursor: 'pointer' }}
                      onClick={(e) => { e.stopPropagation(); removeRecentSearch(text); }}
                    />
                  </Box>
                ))}
              </Box>

              {recommendations.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight={600} mb={1}>You might like</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
                    {recommendations.slice(0, 4).map((item, idx) => (
                      <Box key={idx} sx={{ width: 150, cursor: 'pointer' }}
                        onClick={() => handleSearchClick(item.title || item.name)}>
                        <Box
                          component="img"
                          src={item.imageUrl || item.ImageUrl || item.image}
                          alt={item.title || item.name}
                          sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '12px', mb: 1 }}
                        />
                        <Typography variant="body2" fontWeight={500}>{item.title || item.name}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Typography variant="subtitle1" fontWeight={600} mb={1}>Popular on Aestify</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {recommendations.slice(4, 8).map((item, idx) => (
                      <Box key={idx} sx={{ width: 150, cursor: 'pointer' }}
                        onClick={() => handleSearchClick(item.title || item.name)}>
                        <Box
                          component="img"
                          src={item.imageUrl || item.ImageUrl || item.image}
                          alt={item.title || item.name}
                          sx={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: '12px', mb: 1 }}
                        />
                        <Typography variant="body2" fontWeight={500}>{item.title || item.name}</Typography>
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
