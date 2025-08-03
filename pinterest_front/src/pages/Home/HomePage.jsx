import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';
import SearchModal from '../../components/SearchModal';

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
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
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
    <Container maxWidth="xl" sx={{ pl: 0, pr: 0, ml: 0, position: 'relative' }}>
      <Box
        sx={{
          filter: showSearchModal ? 'blur(5px)' : 'none',
          transition: 'filter 0.3s ease',
          pointerEvents: showSearchModal ? 'none' : 'auto',
        }}
      >
        <DiscoverHeader
          user={user}
          onSearch={setSearch}
          onLogin={handleLogin}
          onSignup={handleSignup}
          onFocusSearch={() => setShowSearchModal(true)}
          searchRef={searchRef}
        />

        <Box sx={{ mt: 4, ml: 0 }}>
          {tags.length > 0 && (
            <TagsFilter
              tags={tags}
              activeTag={search}
              onTagSelect={(tag) => {
                if (search === tag) setSearch('');
                else setSearch(tag);
                setActiveTag('');
                setSearchResults([]);
              }}
            />
          )}

          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>Завантаження...</div>
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
