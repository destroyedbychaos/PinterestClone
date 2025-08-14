import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Box, Container, Typography } from '@mui/material';
import MasonryGrid from '../../components/ui/MasonryGrid';
import { fetchSavedPins } from '../../utils/fetchSavedPins';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../../store/slices/AuthSlice.js';
import { useNavigate } from 'react-router-dom';
import SideMenu from '../../components/layout/SideMenu';


const API_BASE = '/api';

const SavedPins = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [boardId, setBoardId] = useState(null);
  const [pins, setPins] = useState([]);
  const [query, setQuery] = useState('');

  const [recPins, setRecPins] = useState([]);
  const [recPage, setRecPage] = useState(1);
  const [recHasMore, setRecHasMore] = useState(true);
  const [recLoading, setRecLoading] = useState(false);
  const sentinelRef = useRef(null);
  const [savedIds, setSavedIds] = useState([]);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const list = await fetchSavedPins(token, user?.displayName || user?.userName);
        list.forEach(p => (p.isSaved = true));
        setPins(list);
        setSavedIds(list.map(p => (p.id || '').toString()));
      } catch (e) {
        setError(e.message || 'Помилка');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);


  useEffect(() => {
    const onChanged = () => {
      const token = localStorage.getItem('token');
      fetchSavedPins(token, user?.displayName || user?.userName)
        .then((list) => {
          list.forEach(p => (p.isSaved = true));
          setPins(list);
          setSavedIds(list.map(p => (p.id || '').toString()));
        })
        .catch(() => {});
    };
    window.addEventListener('savedPinsChanged', onChanged);
    return () => window.removeEventListener('savedPinsChanged', onChanged);
  }, [user?.displayName, user?.userName]);


  useEffect(() => {
    setRecPins([]);
    setRecPage(1);
    setRecHasMore(true);
  }, [query]);

  useEffect(() => {
    const load = async () => {
      if (!recHasMore || recLoading) return;
      try {
        setRecLoading(true);
        const params = new URLSearchParams({
          pageNumber: String(recPage),
          pageSize: String(20),
        });
        if (query) params.append('searchTerm', query);
        const res = await fetch(`${API_BASE}/Pins?${params.toString()}`);
        const data = await res.json();
        const items = (data?.Pins || data?.pins || []).map(pin => ({
          id: pin.Id || pin.id,
          image: pin.ImageUrl || pin.imageUrl || pin.image,
          title: pin.Title || pin.title,
          description: pin.Description || pin.description,
          author: pin.UserName || pin.userName || pin.author,
          tags: Array.isArray(pin.Tags || pin.tags)
            ? (pin.Tags || pin.tags).map((t) => String(t).trim()).filter(Boolean)
            : String(pin.Tags || pin.tags || '')
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean),
        }));
        setRecPins(prev => [...prev, ...items]);
        const pn = data?.PageNumber || data?.pageNumber || recPage;
        const totalPages = data?.TotalPages || data?.totalPages || recPage;
        if (pn >= totalPages || items.length === 0) setRecHasMore(false);
      } catch (e) {
        setRecHasMore(false);
      } finally {
        setRecLoading(false);
      }
    };
    load();
  }, [recPage, recHasMore, recLoading, query]);


  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && recHasMore && !recLoading) {
          setRecPage((p) => p + 1);
        }
      });
    }, { rootMargin: '200px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, [recHasMore, recLoading]);


  useEffect(() => {
    if (!showMenu) return;
    function handleClickOutside(e) {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target) &&
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const filtered = useMemo(() => {
    if (!query) return pins;
    const q = query.toLowerCase();
    return pins.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }, [pins, query]);

  const recPinsDisplay = useMemo(() => {
    return recPins.map(p => ({
      ...p,
      isSaved: savedIds.includes((p.id || '').toString()),
    }));
  }, [recPins, savedIds]);

  return (
    <Container maxWidth={false} disableGutters sx={{ padding: 0, margin: 0 }}>
      <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#ffffff', overflowX: 'hidden' }}>
        <Box sx={{ width: '144px', flexShrink: 0 }}>
          <SideMenu flush />
        </Box>
        <Box sx={{ flex: 1, marginLeft: '144px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 8px 24px' }}>
          <Typography
            sx={{
              color: 'var(--Dark-900, #000D17)',
              fontFamily: 'Geologica, sans-serif',
              fontSize: '51px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
            }}
          >
            Results from your Aests
          </Typography>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                display: 'flex',
                width: 558,
                height: 64,
                padding: '16px 24px',
                alignItems: 'center',
                gap: 16,
                flexShrink: 0,
                borderRadius: 100,
                background: 'var(--Light-200, #EAEFF9)'
              }}
            >
              <input
                type="text"
                placeholder="Search saved"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  height: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontFamily: 'Geologica, sans-serif',
                  fontSize: 18,
                }}
              />
            </div>

            <div
              className="discover-header__profile"
              style={{ boxSizing: 'border-box', position: 'relative', cursor: 'pointer' }}
              ref={profileRef}
              tabIndex={0}
              onClick={() => setShowMenu(v => !v)}
            >
               {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="discover-header__avatar-img" />
               ) : (
                <span className="discover-header__avatar-img" style={{ background: '#eaeff9' }} />
               )}
              <span className="discover-header__profile-name">
                {user?.displayName || user?.userName || user?.email || 'User'}
              </span>
              {showMenu && (
                <div className="profile-dropdown-menu" ref={menuRef} tabIndex={-1}>
                  <div className="profile-dropdown-menu__current">Currently in</div>
                  <div className="profile-dropdown-menu__user">
                    {user?.avatarUrl ? (
                      <img src={user.avatarUrl} alt="avatar" className="profile-dropdown-menu__avatar" />
                    ) : (
                      <span className="profile-dropdown-menu__avatar" />
                    )}
                    <div className="profile-dropdown-menu__info">
                      <div className="profile-dropdown-menu__name">{user?.displayName || user?.userName || user?.email}</div>
                      <div className="profile-dropdown-menu__username">@{user?.userName || user?.displayName || user?.email}</div>
                    </div>
                  </div>
                  <div className="profile-dropdown-menu__accounts">Your accounts</div>
                  <button className="profile-dropdown-menu__btn" onClick={() => { setShowMenu(false); navigate('/register'); }}>Add account</button>
                  <button className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout" onClick={() => { dispatch(logout()); setShowMenu(false); window.location.reload(); }}>Log out</button>
                </div>
              )}
            </div>
          </div>
        </Box>

        <Box sx={{ padding: '0 24px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: 40 }}>Завантаження...</div>
          ) : error ? (
            <div style={{ textAlign: 'center', marginTop: 40, color: 'crimson' }}>{error}</div>
          ) : (
            <MasonryGrid
              pins={filtered}
              onPinUnsave={async (id) => {
                try {
                  const token = localStorage.getItem('token');
                  const res = await fetch(`${API_BASE}/Pins/${id}/save`, {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  if (!res.ok) throw new Error('Не вдалося прибрати пін');
                  setPins(prev => prev.filter(p => p.id !== id));
                  setSavedIds(prev => prev.filter(x => x !== id));
                } catch (e) {
                  console.error(e);
                }
              }}
              limitedMenu
            />
          )}
        </Box>

        <div
          style={{
            textAlign: 'center',
            margin: '24px 0',
            color: 'var(--Dark-300, #52697C)',
            fontFamily: 'Geologica, sans-serif',
            fontSize: '21px',
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 'normal',
          }}
        >
          You’ve reached the end of your saved Aests about{' '}
          <span
            style={{
              color: 'var(--Dark-900, #000D17)',
              fontFamily: 'Geologica, sans-serif',
              fontSize: '21px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
            }}
          >
            {query || 'Pancakes'}
          </span>
          .
        </div>

        <div
          style={{
            width: '1800px',
            height: '1px',
            background: '#D7E0F4',
            margin: '12px auto',
            maxWidth: '100%'
          }}
        />


        <Box sx={{ padding: '0 24px 24px 24px' }}>
          <div style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
            <div style={{
              color: 'var(--Dark-900, #000D17)',
              textAlign: 'center',
              fontFamily: 'Geologica, sans-serif',
              fontSize: 38,
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: 'normal',
            }}>Another Aests</div>
            <div style={{
              color: 'var(--Dark-300, #52697C)',
              textAlign: 'center',
              fontFamily: 'Geologica, sans-serif',
              fontSize: 21,
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: 'normal',
              marginTop: 6,
            }}>
              Here are some other ideas you might like about{' '}
              <span style={{
                color: 'var(--Dark-900, #000D17)',
                fontFamily: 'Geologica, sans-serif',
                fontSize: 21,
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
              }}>{query || 'Pancakes'}</span>.
            </div>
          </div>

          <MasonryGrid
            pins={recPinsDisplay}
               onPinSave={(id) => {
              const idStr = (id || '').toString();
              setSavedIds(prev => (prev.includes(idStr) ? prev : [...prev, idStr]));
              setPins(prev => {
                if (prev.some(p => (p.id || '').toString() === idStr)) return prev;
                const found = recPins.find(p => (p.id || '').toString() === idStr);
                return found ? [{ ...found, isSaved: true }, ...prev] : prev;
              });
            }}
               onPinUnsave={(id) => {
              const idStr = (id || '').toString();
              setSavedIds(prev => prev.filter(x => x !== idStr));
              setPins(prev => prev.filter(p => (p.id || '').toString() !== idStr));
            }}
          />
          <div ref={sentinelRef} style={{ height: 1 }} />
          {recLoading && <div style={{ textAlign: 'center', marginTop: 12 }}>Loading more...</div>}
        </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default SavedPins;

