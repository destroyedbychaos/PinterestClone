import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';
import SearchModal from '../../components/SearchModal';
import cat from "../../assets/images/cat.png";
import sunflower from '../../assets/images/sunflower.png';
import sky from '../../assets/images/sky.png';
import interior from '../../assets/images/interior.png';
import fish from '../../assets/images/fish.png';
import japan from '../../assets/images/japan.png';
import pizza from '../../assets/images/pizza.png';
import plants from '../../assets/images/plants.png';

const API_BASE = '/api';

const HomePage = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState('');
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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

  const recentSearches = ['Funny cats meme', 'Yellow aesthetic', 'UI design', 'Nature wallpapers', 'Logo ideas A monogram'];
  const mightLike = [
  { img: cat, title: 'Cute munchkin kittens' },
  { img: sunflower, title: 'Sunflowers' },
  { img: sky, title: 'Beautiful sky pictures' },
  { img: interior, title: 'Interior design' },
];

const popular = [
  { img: fish, title: 'Cool fishes' },
  { img: japan, title: 'Best Japan photoshots' },
  { img: pizza, title: 'Food' },
  { img: plants, title: 'Beautiful flowers and plants' },
];

  return (
    <Container maxWidth="xl" sx={{ pl: 0, pr: 0, ml: 0 }}>
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
          <div className="tags-filter">
            {tags.map((tag) => (
              <button
                key={tag}
                className={`tags-filter__btn${search === tag ? ' tags-filter__btn--active' : ''}`}
                onClick={() => {
                  if (search === tag) setSearch('');
                  else setSearch(tag);
                  setActiveTag('');
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', marginTop: 40 }}>Завантаження...</div>
        ) : (
          <MasonryGrid
            pins={pins.map((pin) => {
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

      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={() => setShowOnboarding(false)}
      />

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        recentSearches={recentSearches}
        mightLike={mightLike}
        popular={popular}
      />
    </Container>
  );
};

export default HomePage;
