import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';
import SearchModal from '../../components/SearchModal';
import ImageSearchModal from '../../components/ImageSearchModal';
import PinViewModal from '../../components/PinViewModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { apiUrl } from '../../env';
import settingsApi from '../../services/settingsApi';
import { updateUser } from '../../../store/slices/AuthSlice';

const API_BASE = apiUrl;

const HomePage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const user = useCurrentUser();
  const dispatch = useDispatch();
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [pins, setPins] = useState([]);
  const [hiddenPinIds, setHiddenPinIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showPinViewModal, setShowPinViewModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === 'true') {
      setShowOnboarding(true);
      localStorage.removeItem('isNewUser');
    }
  }, []);

  const displayedPins = (searchResults.length > 0 ? searchResults : pins).filter((pin) => {
    const pinId = pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString();
    return !hiddenPinIds.includes(pinId);
  });

  const mappedPins = useMemo(() => {
    return displayedPins.map((pin) => {
      let image = pin.ImageUrl || pin.imageUrl || pin.image;
      if (image && !/^https?:\/\//.test(image)) {
        if (!image.startsWith('/')) image = '/images/' + image.replace(/^.*[\\/]/, '');
      }
      return {
        id: pin.Id || pin.id,
        image,
        title: pin.Title || pin.title,
        description: pin.Description || pin.description,
        author: pin.UserName || pin.userName || pin.author,
        tags: (pin.Tags || pin.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      };
    });
  }, [displayedPins]);

  const fetchPins = async (page, reset = false) => {
    const scrollY = window.scrollY;
    setLoading(true);
    let url = `${API_BASE}/pins?pageNumber=${page}&pageSize=100`;
    const tagParam = activeTag ? activeTag.trim().toLowerCase() : '';
    if (tagParam) url += `&tags=${encodeURIComponent(tagParam)}`;
    if (search) url += `&searchTerm=${encodeURIComponent(search)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      const foundPins = data.Pins || data.pins || [];

      if (reset) window.scrollTo(0, scrollY);
      if (reset) {
        setPins(foundPins);
      } else {
        setPins((prev) => [...prev, ...foundPins]);
      }

      setHasMore(foundPins.length >= 40);
    } catch (e) {
      console.error(e);
      if (reset) setPins([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setPageNumber(1);
    fetchPins(1, true);
  }, [activeTag, search]);

  useEffect(() => {
    if (pageNumber > 1) {
      fetchPins(pageNumber);
    }
  }, [pageNumber]);

  useEffect(() => {
    fetch(`${API_BASE}/pins/all-tags`)
      .then((res) => res.json())
      .then((data) => {
        const limitedTags = data.slice(0, 6);
        setTags(limitedTags);
      })
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/HiddenPins/hidden-ids`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.payload) {
            setHiddenPinIds(data.payload);
          } else {
            setHiddenPinIds([]);
          }
        })
        .catch(() => setHiddenPinIds([]));
    } else {
      setHiddenPinIds([]);
    }
  }, [token]);

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

  const handlePinClick = (pin) => {
    console.log('🖱️ Клік на пін:', pin);
    setSelectedPin(pin);
    setShowPinViewModal(true);
  };

  const handlePinViewClose = () => {
    setShowPinViewModal(false);
    setSelectedPin(null);
  };

  const handlePinHidden = (pinId) => {
    setHiddenPinIds((prev) => [...prev, pinId]);
    setPins((prev) =>
      prev.filter((pin) => {
        const currentPinId = pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString();
        return currentPinId !== pinId;
      })
    );
  };

  return (
    <Container maxWidth={false} sx={{ padding: 0 }}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
        <DiscoverHeader
          user={user}
          onSearch={setSearch}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onFocusSearch={() => setShowSearchModal(true)}
          searchRef={searchRef}
          onImageSearch={() => {
            setShowImageSearch(true);
            setShowSearchModal(false);
          }}
        />

        <Box sx={{ padding: '0 24px' }}>
          <TagsFilter
            tags={tags}
            activeTag={activeTag}
            onTagSelect={setActiveTag}
          />

          {searchResults.length > 0 && (
            <div
              style={{
                textAlign: 'center',
                marginTop: 20,
                marginBottom: 20,
                padding: '16px',
              }}
            >
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
                  fontFamily: 'inherit',
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
                ✕ Clear search results
              </button>
            </div>
          )}

          {(loading || imageSearchLoading) ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
                              {imageSearchLoading ? 'Searching for similar images...' : 'Loading...'}
            </div>
          ) : (
            <MasonryGrid
              pins={mappedPins}
              onPinHidden={handlePinHidden}
              onPinClick={handlePinClick}
            />
          )}

          {refreshing && (
            <div style={{ textAlign: 'center', margin: '20px 0' }}>
              <span>Refreshing...</span>
            </div>
          )}
        </Box>
      </Box>


      <PinViewModal
        pin={selectedPin}
        isOpen={showPinViewModal}
        onClose={handlePinViewClose}
        source="home"
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

      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={async (userData) => {
          try {

            const settingsData = {
              displayName: userData.name,
              userName: userData.username,
              gender: userData.gender === 'female' ? 'Female' : userData.gender === 'male' ? 'Male' : 'Other',
              country: userData.country === 'ukraine' ? 'Ukraine (Україна)' : 
                      userData.country === 'usa' ? 'United States' : 
                      userData.country === 'uk' ? 'United Kingdom' : 'Ukraine (Україна)',
              language: userData.language === 'english' ? 'English (UK)' : 
                       userData.language === 'ukrainian' ? 'Ukrainian' : 'English (UK)'
            };
            
            await settingsApi.updateSettings(settingsData);
            
            dispatch(updateUser(settingsData));
            
            console.log('Onboarding data saved:', userData);
          } catch (error) {
            console.error('Error saving onboarding data:', error);
          }
          
          setShowOnboarding(false);
        }}
      />

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        recentSearches={recentSearches}
        setRecentSearches={setRecentSearches}
        onSearchResults={(results) => setSearchResults(results)}
        showImageSearch={showImageSearch}
        setShowImageSearch={setShowImageSearch}
      />

      <ImageSearchModal
        open={showImageSearch}
        onClose={() => setShowImageSearch(false)}
        onSearchResults={(results) => {
          setSearchResults(results);
          setShowImageSearch(false);
          setImageSearchLoading(false);
        }}
        onSearchStart={() => setImageSearchLoading(true)}
      />
    </Container>
  );
};

export default HomePage;
