import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Box, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OnboardingModal from '../../components/OnboardingModal';
import MasonryGrid from '../../components/ui/MasonryGrid';
import TagsFilter from '../../components/ui/TagsFilter';
import DiscoverHeader from '../../components/layout/DiscoverHeader';

const API_BASE = '/api';

const HomePage = () => {
    const [showOnboarding, setShowOnboarding] = useState(false);
    const { user } = useSelector((state) => state.auth);
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

    useEffect(() => {
        if (activeTag) {
        } else if (search) {
        }
    }, [activeTag, search]);

    useEffect(() => {
        setLoading(true);
        let url = `${API_BASE}/pins?pageNumber=1&pageSize=40`;
        const tagParam = activeTag ? activeTag.trim().toLowerCase() : '';
        if (tagParam) url += `&tags=${encodeURIComponent(tagParam)}`;
        if (search) url += `&searchTerm=${encodeURIComponent(search)}`;
        fetch(url)
            .then(res => res.json())
            .then(data => {
                const foundPins = data.Pins || data.pins || [];
                setPins(foundPins);
                if (activeTag) {
                } else if (search && foundPins.length > 0) {
                }
            })
            .catch(() => setPins([]))
            .finally(() => setLoading(false));
    }, [activeTag, search]);

    useEffect(() => {
        fetch(`${API_BASE}/pins/all-tags`)
            .then(res => res.json())
            .then(data => {
                setTags(data);
            })
            .catch(() => setTags([]));
    }, []);

    const handleOnboardingComplete = (userData) => {
        setShowOnboarding(false);
    };

    const handleLogin = () => {
        navigate('/login');
    };
    const handleSignup = () => {
        navigate('/register');
    };

    return (
        <Container maxWidth="xl" sx={{ pl: 0, pr: 0, ml: 0 }}>
            <DiscoverHeader user={user} onSearch={setSearch} onLogin={handleLogin} onSignup={handleSignup} />
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