import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
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
    const [hiddenPinIds, setHiddenPinIds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    
    
    const token = localStorage.getItem('token');

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
        const limitedTags = data.slice(0, 6);
        setTags(limitedTags);
      })
      .catch(() => setTags([]));
  }, []);


    useEffect(() => {
        if (token) {
            console.log('Fetching hidden pin IDs for authenticated user...');
            fetch(`${API_BASE}/HiddenPins/hidden-ids`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => {
                console.log('Hidden pins response status:', res.status);
                return res.json();
            })
            .then(data => {
                console.log('Hidden pins response:', data);
                if (data.success && data.payload) {
                    console.log('Setting hidden pin IDs:', data.payload);
                    setHiddenPinIds(data.payload);
                } else {
                    console.log('No hidden pins data in response');
                    setHiddenPinIds([]);
                }
            })
            .catch((error) => {
                console.error('Error fetching hidden pins:', error);
                setHiddenPinIds([]);
            });
        } else {
            console.log('No token found, not fetching hidden pins');
            setHiddenPinIds([]);
        }
    }, [token]);

    const handleOnboardingComplete = (userData) => {
        setShowOnboarding(false);
    };

    const handleLogin = () => {
        navigate('/login');
    };
    const handleSignup = () => {
        navigate('/register');
    };

  const handlePinHidden = (pinId) => {
    setHiddenPinIds((prev) => [...prev, pinId]);
    setPins((prev) => prev.filter((pin) => {
      const currentPinId = pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString();
      return currentPinId !== pinId;
    }));
  };

  const displayedPins = (searchResults.length > 0 ? searchResults : pins).filter((pin) => {
    const pinId = pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString();
    return !hiddenPinIds.includes(pinId);
  });

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
                  image = '/images/' + image.replace(/^.*[\\/]/, '');
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
              onPinHidden={handlePinHidden}
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
        onClose={() => setShowSearchModal(false)}
        recentSearches={recentSearches}
        setRecentSearches={setRecentSearches}
        onSearchResults={(results) => setSearchResults(results)}
      />
    </Container>
  );
};

export default HomePage;
