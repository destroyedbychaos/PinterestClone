import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';
import SearchModal from '../../components/SearchModal';
import ImageSearchModal from '../../components/ImageSearchModal';
import PinViewModal from '../../components/PinViewModal';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import settingsApi from '../../services/settingsApi';
import { updateUser } from '../../../store/slices/AuthSlice';

const API_BASE = apiUrl;

const HomePage = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { user, isAuthenticated } = useSelector((state) => state.pinterestAuth);
    const [tags, setTags] = useState([]);
    const [activeTag, setActiveTag] = useState('');
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

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
    setPins((prev) => prev.filter((pin) => {
      const currentPinId = pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString();
      return currentPinId !== pinId;
    }));
  };

    return (
        <Container maxWidth="xl" sx={{ pl: 0, pr: 0, ml: 0 }}>
            <DiscoverHeader user={isAuthenticated ? user : null} onSearch={setSearch} onLogin={handleLogin} onSignup={handleSignup} />
            <Box sx={{ mt: 4, ml: 0 }}>
                {tags.length > 0 && (
                    <div className="tags-filter">
                        {tags.map((tag) => (
                            <button
                                key={tag}
                                className={`tags-filter__btn${search === tag ? " tags-filter__btn--active" : ""}`}
                                onClick={() => {
                                    if (search === tag) {
                                        setSearch('');
                                    } else {
                                        setSearch(tag);
                                    }
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
                    <MasonryGrid pins={pins.map(pin => {
                        let image = pin.ImageUrl || pin.imageUrl || pin.image;
                        if (image) {
                            if (/^https?:\/\//.test(image)) {
                            } else if (image.startsWith('/images/')) {
                            } else if (!image.startsWith('/')) {
                                image = '/images/' + image.replace(/^.*[\\\/]/, '');
                            }
                        }
                        return {
                            id: pin.Id || pin.id,
                            image,
                            title: pin.Title || pin.title,
                            description: pin.Description || pin.description,
                            author: pin.UserName || pin.userName || pin.author,
                            tags: (pin.Tags || pin.tags || '').split(',').map(t => t.trim()).filter(Boolean),
                        }
                    })} />
                )}
            </Box>
            <OnboardingModal
                open={showOnboarding}
                onClose={() => setShowOnboarding(false)}
                onComplete={handleOnboardingComplete}
            />
        </Container>
    );
};

export default HomePage;
