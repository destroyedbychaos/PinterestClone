import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Avatar, Button } from "@mui/material";
import ProfileHeader from "../../components/layout/ProfileHeader";
import SideMenu from "../../components/layout/SideMenu";
import MasonryGrid from "../../components/ui/MasonryGrid";
import defaultBanner from "../../assets/images/sky.png";
import defaultAvatar from "../../assets/images/noImgUser.png";
import { useNavigate } from "react-router-dom";
import SavedPins from "../Saved/SavedPins.jsx";
import { fetchSavedPins } from "../../utils/fetchSavedPins";

const API_BASE = "/api";

const ProfileBoards = () => {
  const authState = useSelector((state) => state.auth);
  const searchRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("Boards");
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [savedPins, setSavedPins] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [showSavedOverlay, setShowSavedOverlay] = useState(false);

  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), [authState?.token]);

  const handleSearch = () => {
    setShowSavedOverlay(true);
  };

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        setLoadingProfile(true);
        const res = await fetch(`${API_BASE}/Profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load profile");
        const data = await res.json();
        if (isMounted) setProfile(data);
      } catch {
        if (isMounted) setProfile(null);
      } finally {
        if (isMounted) setLoadingProfile(false);
      }
    };
    if (token) run();
    else {
      setProfile(null);
      setLoadingProfile(false);
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    const loadPins = async (userId) => {
      try {
        setLoadingPins(true);
        const res = await fetch(`${API_BASE}/Pins/user/${userId}?pageNumber=1&pageSize=60`);
        if (!res.ok) throw new Error("Failed to load pins");
        const data = await res.json();
        const list = data?.Pins || data?.pins || [];
        if (isMounted) setPins(list);
      } catch {
        if (isMounted) setPins([]);
      } finally {
        if (isMounted) setLoadingPins(false);
      }
    };
    if (profile?.id) loadPins(profile.id);
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);

  useEffect(() => {
    let isMounted = true;
    const loadBoards = async (userId) => {
      try {
        setLoadingBoards(true);
        const res = await fetch(`${API_BASE}/Boards/user/${userId}?pageNumber=1&pageSize=50`);
        if (!res.ok) throw new Error("Failed to load boards");
        const data = await res.json();
        const list = data?.Boards || data?.boards || [];
        if (isMounted) setBoards(list);
      } catch {
        if (isMounted) setBoards([]);
      } finally {
        if (isMounted) setLoadingBoards(false);
      }
    };
    if (profile?.id) loadBoards(profile.id);
    return () => {
      isMounted = false;
    };
  }, [profile?.id]);


  useEffect(() => {
    let active = true;
    const run = async () => {
      if (activeTab !== 'Aests') return;
      try {
        setLoadingSaved(true);
        setSavedError('');
        const token = localStorage.getItem('token');
        const list = await fetchSavedPins(token, profile?.displayName || profile?.userName);
        if (active) setSavedPins(list);
      } catch (e) {
        if (active) {
          setSavedPins([]);
          setSavedError(e.message || 'Помилка');
        }
      } finally {
        if (active) setLoadingSaved(false);
      }
    };
    run();
    return () => { active = false; };
  }, [activeTab, profile?.displayName, profile?.userName]);


  useEffect(() => {
    const onChanged = () => {
      if (activeTab !== 'Aests') return;
      const token = localStorage.getItem('token');
      fetchSavedPins(token, profile?.displayName || profile?.userName)
        .then(setSavedPins)
        .catch(() => {});
    };
    window.addEventListener('savedPinsChanged', onChanged);
    return () => window.removeEventListener('savedPinsChanged', onChanged);
  }, [activeTab, profile?.displayName, profile?.userName]);

  const normalizedPins = useMemo(() => {
    return pins.map((pin) => {
      let image = pin.ImageUrl || pin.imageUrl || pin.image;
      if (image && !/^https?:\/\//.test(image)) {
        if (!image.startsWith("/")) image = "/images/" + image.replace(/^.*[\\/]/, "");
      }
      const rawTags = pin.Tags ?? pin.tags ?? '';
      const tags = Array.isArray(rawTags)
        ? rawTags.map((t) => String(t).trim()).filter(Boolean)
        : String(rawTags || "")
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean);
      return {
        id: pin.Id || pin.id,
        image,
        title: pin.Title || pin.title,
        description: pin.Description || pin.description,
        author: pin.UserName || pin.userName || profile?.displayName || profile?.userName,
        tags,
      };
    });
  }, [pins, profile]);

  const bannerUrl = profile?.bannerUrl || defaultBanner;
  const avatarUrl = profile?.avatarUrl || defaultAvatar;
  const displayName = profile?.displayName || profile?.userName || "User";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <Box>
        <SideMenu />
      </Box>

      <Box sx={{ flex: 1 }}>
        <ProfileHeader
          user={authState?.user}
          onSearch={handleSearch}
          searchRef={searchRef}
          onFocusSearch={() => setShowSavedOverlay(true)}
        />

        <Box sx={{ bgcolor: "#fff", borderRadius: "16px", overflow: "hidden", mt: "30px" }}>
          <Box
            sx={{
              width: "98%",
              height: 180,
              borderTopLeftRadius: "40px",
              borderTopRightRadius: "40px",
              overflow: "hidden",
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <Box sx={{ position: "relative", px: 3, pb: 2, mt: -10 }}>
            <Box
              sx={{
                position: "relative",
                display: "inline-block",
                borderRadius: "50%",
                bgcolor: "#fff",
                p: 0.7,
                boxShadow: 1,
              }}
            >
              <Avatar
                src={avatarUrl}
                alt="avatar"
                sx={{ width: 112, height: 112, borderRadius: "50%" }}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mt: -12,
                ml: "-25px",
                bgcolor: "#fff",
                borderTopLeftRadius: "40px",
                borderTopRightRadius: "40px",
                p: 2,
              }}
            >
              <Box sx={{ ml: 18, flex: 1 }}>
                <Box sx={{ fontSize: 20, fontWeight: 700 }}>{displayName}</Box>
                <Box sx={{ color: "#6b7280", fontSize: 14 }}>@{displayName}</Box>
                <Box sx={{ color: "#111827", fontSize: 14, mt: 0.5 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {profile?.followersCount ?? 0} followers
                  </Box>{" "}
                  ·{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {profile?.followingCount ?? 0} following
                  </Box>
                </Box>
              </Box>

              <Button
                variant="outlined"
                size="medium"
                sx={{
                  textTransform: "none",
                  borderRadius: 10,
                  px: 2.5,
                  py: 1,
                  bgcolor: "#D7E0F4",
                  color: "#111827",
                  fontWeight: 500,
                  width: "164px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  fontSize: "1rem",
                }}
                onClick={() => navigate('/profile-edit')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M17.263 2.17717C17.5912 1.84924 18.0361 1.66504 18.5 1.66504C18.9639 1.66504 19.4089 1.84924 19.737 2.17717L22.323 4.76317C22.6509 5.09132 22.8351 5.53625 22.8351 6.00017C22.8351 6.46408 22.6509 6.90901 22.323 7.23717L19.53 10.0302L19.518 10.0432L8.69001 20.3782C8.49219 20.5673 8.25278 20.7074 7.99101 20.7872L2.46801 22.4672C2.33813 22.5063 2.20007 22.5095 2.06853 22.4764C1.93698 22.4433 1.81688 22.3751 1.72101 22.2792C1.62505 22.1833 1.55689 22.0632 1.52378 21.9316C1.49067 21.8001 1.49386 21.662 1.53301 21.5322L3.20601 16.0322C3.29375 15.7443 3.45425 15.4839 3.67201 15.2762L14.476 4.96317L17.263 2.17717ZM4.70801 16.3612C4.67708 16.3911 4.65406 16.4282 4.64101 16.4692L3.37701 20.6232L7.55401 19.3522C7.59151 19.3406 7.62576 19.3204 7.65401 19.2932L17.927 9.48717L14.987 6.54817L4.70801 16.3612ZM19 8.44017L21.263 6.17817C21.2863 6.15494 21.3048 6.12736 21.3174 6.09698C21.33 6.06661 21.3365 6.03405 21.3365 6.00117C21.3365 5.96828 21.33 5.93572 21.3174 5.90535C21.3048 5.87498 21.2863 5.84739 21.263 5.82417L18.677 3.23817C18.6538 3.21488 18.6262 3.19641 18.5958 3.18381C18.5655 3.17121 18.5329 3.16472 18.5 3.16472C18.4671 3.16472 18.4346 3.17121 18.4042 3.18381C18.3738 3.19641 18.3462 3.21488 18.323 3.23817L16.061 5.50017L19 8.44017Z"
                    fill="#000D17"
                  />
                </svg>
                Edit profile
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, px: 2 }}>
            {["Aests", "Boards", "Created"].map((tab) => (
              <Button
                key={tab}
                onClick={() => {
                  if (tab === "Boards") {
                    setActiveTab("Boards");
                  } else if (tab === "Aests") {
                    setActiveTab("Aests");
                  } else if (tab === "Created") {
                    navigate("/profile-created");
                  }
                }}
                variant="text"
                sx={{
                  textTransform: "none",
                  borderRadius: 6,
                  px: 2,
                  py: 1,
                  boxShadow: activeTab === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  bgcolor: activeTab === tab ? "#FFFFFF" : "#EAEFF9",
                  color: "#111827",
                  border: activeTab === tab ? "1px solid #EAEFF9" : "none",
                  "&:hover": {
                    bgcolor: "#EAEFF9",
                    borderColor: "#CBD7F1",
                  },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          <Box sx={{ mt: 2, pb: 6 }}>
            {activeTab === "Boards" && (
              <>
                {loadingProfile || loadingBoards ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                      gap: 2,
                    }}
                  >
                    {boards.map((b) => (
                      <Box
                        key={b.Id || b.id}
                        sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}
                      >
                        <Box sx={{ fontWeight: 600 }}>{b.Name || b.name}</Box>
                        <Box sx={{ color: "#6b7280", fontSize: 13 }}>
                          {b.Description || b.description || ""}
                        </Box>
                      </Box>
                    ))}
                    {boards.length === 0 && (
                      <Box sx={{ textAlign: "center", color: "#6b7280", py: 6 }}>
                        No boards yet
                      </Box>
                    )}
                  </Box>
                )}
              </>
            )}

            {activeTab === 'Aests' && (
              <>
                {loadingSaved ? (
                  <Box sx={{ textAlign: 'center', mt: 4, color: '#7B8D9B' }}>Loading...</Box>
                ) : savedError ? (
                  <Box sx={{ textAlign: 'center', mt: 4, color: 'crimson' }}>{savedError}</Box>
                ) : (
                  <MasonryGrid pins={savedPins} limitedMenu />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
      {showSavedOverlay && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 2000 }}
          onClick={() => setShowSavedOverlay(false)}
        >
          <div
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', overflow: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <SavedPins />
          </div>
        </div>
      )}
    </Box>
  );
};

export default ProfileBoards;
