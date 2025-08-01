import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';
import SearchModal from '../../components/SearchModal';
import ImageSearchModal from '../../components/ImageSearchModal';
import { IconButton } from '@mui/material';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';


const API_BASE = '/api';

const HomePage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [pins, setPins] = useState([]);
  const [searchResults, setSearchResults] = useState([]); // 🆕
  const [loading, setLoading] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const [recentSearches, setRecentSearches] = useState([]);

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true') {
      setShowOnboarding(true);
      localStorage.removeItem('isNewUser');
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/pins?pageNumber=1&pageSize=40`;
    const tagParam = activeTag ? activeTag.trim().toLowerCase() : '';
    if (tagParam) url += `&tags=${encodeURIComponent(tagParam)}`;
    if (search) url += `&searchTerm=${encodeURIComponent(search)}`;
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const foundPins = data.Pins || data.pins || [];
        setPins(foundPins);
      })
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, [activeTag, search]);

  useEffect(() => {
    fetch(`${API_BASE}/pins/all-tags`)
      .then((res) => res.json())
      .then((data) => {
        setTags(data);
      })
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => navigate('/login');
  const handleSignup = () => navigate('/register');

  const displayedPins = searchResults.length > 0 ? searchResults : pins;

  return (
    <Container maxWidth="xl" sx={{ pl: 0, pr: 0, ml: 0, position: 'relative' }}>
  <Box
    sx={{
      filter: (showSearchModal || showImageSearch) ? 'blur(5px)' : 'none',
      transition: 'filter 0.3s ease',
      pointerEvents: (showSearchModal || showImageSearch) ? 'none' : 'auto', 
    }}
  >
    <DiscoverHeader
      user={user}
      onSearch={setSearch}
      onLogin={handleLogin}
      onSignup={handleSignup}
      onFocusSearch={() => {
        setShowSearchModal(true);
      }}
      searchRef={searchRef}
      onImageSearch={() => {
        setShowImageSearch(true);
        setShowSearchModal(false); 
      }}
    />

    <Box sx={{ mt: 4, ml: 0 }}>
      {tags.length > 0 && (
        <div className="tags-filter">
          {tags.map((tag) => (
            <button
              key={tag}
              className={`tags-filter__btn${search === tag ? ' tags-filter__btn--active' : ''}`}
              onClick={() => {
                if (search === tag) setSearch('');
                else setSearch(tag);
                setActiveTag('');
                setSearchResults([]);
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {searchResults.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 20, 
          marginBottom: 20,
          padding: '16px'
        }}>
          <button 
            onClick={() => {
              setSearchResults([]);
              setSearch('');
              setActiveTag('');
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '24px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#f8f9fa';
              e.target.style.borderColor = '#ccc';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#ddd';
            }}
          >
            ✕ Очистити результати пошуку
          </button>
        </div>
      )}
      
      {(loading || imageSearchLoading) ? (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          {imageSearchLoading ? 'Пошук схожих зображень...' : 'Завантаження...'}
        </div>
      ) : (
        <MasonryGrid
          pins={displayedPins.map((pin) => {
            let image = pin.ImageUrl || pin.imageUrl || pin.image;
            if (image && !/^https?:\/\//.test(image)) {
              if (!image.startsWith('/')) image = '/images/' + image.replace(/^.*[\\\/]/, '');
            }
            return {
              id: pin.Id || pin.id,
              image,
              title: pin.Title || pin.title,
              description: pin.Description || pin.description,
              author: pin.UserName || pin.userName || pin.author,
              tags: (pin.Tags || pin.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
            };
          })}
        />
      )}
    </Box>
  </Box>

  <OnboardingModal
    open={showOnboarding}
    onClose={() => setShowOnboarding(false)}
    onComplete={() => setShowOnboarding(false)}
  />

  <SearchModal
    open={showSearchModal}
    onClose={() => {
      setShowSearchModal(false);
    }}
    recentSearches={recentSearches}
    setRecentSearches={setRecentSearches}
    onSearchResults={(results) => {
      setSearchResults(results);
    }}
    showImageSearch={showImageSearch}
    setShowImageSearch={setShowImageSearch}
  />

  <ImageSearchModal
    open={showImageSearch}
    onClose={() => {
      setShowImageSearch(false);
    }}
    onSearchResults={(results) => {
      setSearchResults(results);
      setShowImageSearch(false);
      setImageSearchLoading(false);
    }}
    onSearchStart={() => {
      setImageSearchLoading(true);
    }}
  />
</Container>

  );
};

export default HomePage;
