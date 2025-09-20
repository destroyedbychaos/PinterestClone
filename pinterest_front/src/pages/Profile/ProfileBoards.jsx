import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Avatar, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

import ProfileHeader from "../../components/layout/ProfileHeader";
import SideMenu from "../../components/layout/SideMenu";
import MasonryGrid from "../../components/ui/MasonryGrid";
import SavedPins from "../Saved/SavedPins.jsx";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { fetchSavedPins } from "../../utils/fetchSavedPins";
import { apiUrl } from "../../env.js";
import BoardOptionsModal from "../../components/ui/BoardOptionsModal.jsx";

const defaultBannerSvg = (
  <svg width="1720" height="260" viewBox="0 0 1720 260" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1720" height="260" rx="40" fill="#EAEFF9"/>
  </svg>
);

const API_BASE = apiUrl;

const ProfileBoards = () => {
  const authState = useSelector((state) => state.auth);
  const currentUser = useCurrentUser();
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const token = useMemo(() => localStorage.getItem("token"), [authState?.token]);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("Boards");
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [savedPins, setSavedPins] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [savedError, setSavedError] = useState("");
  const [showSavedOverlay, setShowSavedOverlay] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [boardOptionsOpen, setBoardOptionsOpen] = useState(false);
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [optionsPosition, setOptionsPosition] = useState(null);

  useEffect(() => {
    if (currentUser) {
      setProfile(currentUser);
      setLoadingProfile(false);
    } else {
      setProfile(null);
      setLoadingProfile(true);
    }
  }, [currentUser]);

  const refreshProfile = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/Profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Error refreshing profile:', error);
    }
  };

  useEffect(() => {
    const onProfileUpdate = () => refreshProfile();
    window.addEventListener('profileUpdated', onProfileUpdate);
    return () => window.removeEventListener('profileUpdated', onProfileUpdate);
  }, []);

  useEffect(() => {
    if (!profile?.id) return;

    const fetchBoards = async (userId) => {
      setLoadingBoards(true);
      try {
        const boardsRes = await fetch(`${API_BASE}/Boards/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!boardsRes.ok) throw new Error("Failed to fetch boards");
        const boardsData = await boardsRes.json();
        const boardsRaw = boardsData.boards || boardsData.Boards || [];

        const boardsWithPins = await Promise.all(
          boardsRaw.map(async (b) => {
            let pinsBoard = [];
            try {
              const pinsRes = await fetch(`${API_BASE}/Pins/board/${b.id}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              if (pinsRes.ok) {
                const pinsData = await pinsRes.json();
                pinsBoard = pinsData.pins || [];
              }
            } catch {}
            return {
              id: b.id,
              title: b.name || "Untitled Board",
              description: b.description || "",
              ownerId: b.userId,
              pinsBoard,
              updatedAt: b.updatedAt || Date.now(),
              isPrivate: b.isPrivate || false,
              isArchived: b.isArchived || false
            };
          })
        );

        setBoards(boardsWithPins);
        setResults(boardsWithPins);
      } catch (err) {
        console.error(err);
        setBoards([]);
        setResults([]);
      } finally {
        setLoadingBoards(false);
      }
    };

    fetchBoards(profile.id);
  }, [profile?.id, token]);

  const handleDelete = async (board) => {
    if (board.ownerId !== profile.id) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete the board "${board.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const res = await fetch(`${API_BASE}/Boards/${board.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete board");

      setBoards((prev) => prev.filter((b) => b.id !== board.id));
      setResults((prev) => prev.filter((b) => b.id !== board.id));
      setBoardOptionsOpen(false);
      setSelectedBoard(null);

    } catch (err) {
      console.error(err);
      alert("Failed to delete the board. Please try again.");
    }
  };

  useEffect(() => {
    if (!query.trim()) {
      setResults(boards);
    } else {
      setResults(
        boards.filter(
          (b) =>
            b.title.toLowerCase().includes(query.toLowerCase()) ||
            b.description.toLowerCase().includes(query.toLowerCase())
        )
      );
    }
  }, [query, boards]);

    const handleArchiveToggle = async (board) => {
      try {
        if (!board.isArchived) {
          const res = await fetch(`${API_BASE}/Boards/${board.id}/archive`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            }, 
          })
          if (!res.ok) throw new Error("Failed to toggle archive");
          const data = await res.json();
          setBoardOptionsOpen(false);
          setBoards((prev) =>
            prev.map((b) =>
              b.id === board.id ? { ...b, isArchived: data.isArchived } : b
            )
          );
        }
        else {
            const res = await fetch(`${API_BASE}/Boards/${board.id}/restore`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (!res.ok) throw new Error("Failed to toggle archive");
          const data = await res.json();
          setBoards((prev) =>
            prev.map((b) =>
              b.id === board.id ? { ...b, isArchived: data.isArchived } : b
            )
          );
        }
      } catch (err) {
        console.error(err);
      }
    };
  
    const handlePrivacyToggle = async (board) => {
      try {
        let res;
  
        if (!board.isPrivate) {
          res = await fetch(`${API_BASE}/Boards/${board.id}/privatise`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          res = await fetch(`${API_BASE}/Boards/${board.id}/publicise`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
        }
  
        if (!res.ok) throw new Error("Failed to toggle privacy");
  
        const data = await res.json();
  
  
        console.log(data);
        setBoards((prev) =>
          prev.map((b) =>
            b.id === board.id ? { ...b, isPrivate: data.isPrivate } : b
          )
        );
  
      } catch (err) {
        console.error(err);
      }
    };
  
    const toggleBoardOptions = (board, e) => {
      e.stopPropagation();
      if (boardOptionsOpen && selectedBoard?.id === board.id) {
        setBoardOptionsOpen(false);
        setSelectedBoard(null);
        setOptionsPosition(null);
      } else {
        setSelectedBoard(board);
        setOptionsPosition({ x: e.clientX, y: e.clientY });
        setBoardOptionsOpen(true);
      }
    };
    useEffect(() => {
      const handleClickOutside = () => {
        if (boardOptionsOpen) {
          setBoardOptionsOpen(false);
          setSelectedBoard(null);
          setOptionsPosition(null);
        }
      };
  
      document.addEventListener("click", handleClickOutside);
  
      return () => {
        document.removeEventListener("click", handleClickOutside);
      };
    }, [boardOptionsOpen]);

  useEffect(() => {
    if (!profile?.id) return;
    let isMounted = true;

    const loadPins = async (userId) => {
      setLoadingPins(true);
      try {
        const res = await fetch(`${API_BASE}/Pins/user/${userId}?pageNumber=1&pageSize=60`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
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

    loadPins(profile.id);
    return () => { isMounted = false; };
  }, [profile?.id, token]);

  const normalizedCreatedPins = useMemo(() => {
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
        tags
      };
    });
  }, [pins, profile]);

  useEffect(() => {
    if (!profile) return;
    if (activeTab !== 'Aests') return;

    let active = true;

    const loadSaved = async () => {
      setLoadingSaved(true);
      setSavedError('');
      try {
        const list = await fetchSavedPins(token, profile.displayName || profile.userName);
        if (active) setSavedPins(list);
      } catch (e) {
        if (active) {
          setSavedPins([]);
          setSavedError(e.message || 'Error');
        }
      } finally {
        if (active) setLoadingSaved(false);
      }
    };

    loadSaved();
    return () => { active = false; };
  }, [activeTab, profile, token]);

  useEffect(() => {
    const onSavedChanged = () => {
      if (activeTab !== 'Aests') return;
      fetchSavedPins(token, profile?.displayName || profile?.userName)
        .then(setSavedPins)
        .catch(() => {});
    };
    window.addEventListener('savedPinsChanged', onSavedChanged);
    return () => window.removeEventListener('savedPinsChanged', onSavedChanged);
  }, [activeTab, profile, token]);

  const handleBoardClick = (board) => {
    if (board.isArchived || (board.isPrivate && String(board.ownerId) !== String(profile.id))) return;
    navigate(`/board/${board.id}`);
  }
  const handleSearch = () => setShowSavedOverlay(true);

  const bannerUrl = profile?.bannerUrl;
  const avatarUrl = profile?.avatarUrl;
  const displayName = profile?.displayName || profile?.userName || "User";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <SideMenu />

      <Box sx={{ flex: 1 }}>
        <ProfileHeader
          user={currentUser}
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#EAEFF9",
            }}
          >
            {bannerUrl ? (
              <Box
                component="img"
                src={bannerUrl}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Box sx={{ transform: "scale(0.1)" }}>{defaultBannerSvg}</Box>
            )}
          </Box>

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
              {avatarUrl ? (
                <Avatar
                  src={avatarUrl}
                  alt="avatar"
                  sx={{ width: 140, height: 140, borderRadius: "50%" }}
                />
              ) : (
                <Box
                  sx={{
                    width: 140,
                    height: 140,
                    borderRadius: "50%",
                    bgcolor: "#EAEFF9",
                    border: "4px solid white",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
              )}
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
              <Box sx={{ ml: 24, flex: 1 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>
                  {profile?.userName || displayName}
                </Typography>
                <Typography sx={{ color: "#6b7280", fontSize: 14, mt: 0.5, maxWidth: "400px" }}>
                  {profile?.bio || "Looking for inspiration..."}
                </Typography>
                <Typography sx={{ color: "#111827", fontSize: 14, mt: 0.5 }}>
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {profile?.followersCount ?? 0} followers
                  </Box>{" "}
                  ·{" "}
                  <Box component="span" sx={{ fontWeight: 600 }}>
                    {profile?.followingCount ?? 0} following
                  </Box>
                </Typography>
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
                Edit profile
              </Button>
            </Box>
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, mt: 3, px: 2 }}>
            {["Aests", "Boards", "Created"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
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
                  "&:hover": { bgcolor: "#EAEFF9", borderColor: "#CBD7F1" },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>

          <Box sx={{ mt: 2, pb: 6 }}>
            {activeTab === "Boards" && (
              <>
                {(loadingProfile || loadingBoards) ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : boards.length > 0 ? (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 1, mt: 3, overflow: "visible" }}>
                    {results.map((board) => {
                      const isOwner = String(board.ownerId) === String(profile.id);

                      return (
                        <Box
                          key={board.id}
                          sx={{
                            position: "relative",
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            height: "400px",
                            padding: 2,
                            cursor: "pointer",
                            display: "flex",
                            flexDirection: "column",
                            transition: "all 0.2s ease",
                            "&:hover": { backgroundColor: "#EAEFF9", transform: "translateY(-1px)" },
                            "&:active": { transform: "translateY(0)" },
                          }}
                          onClick={() => handleBoardClick(board)}
                        >
                          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, width: "100%", height: "calc(100% - 110px)" }}>
                            {(board.pinsBoard || []).slice(0, 3).map((pin, idx) => {
                              const imgSrc = pin.imageUrl || pin.ImageUrl || pin.image;
                              const style = { width: "100%", height: "100%", objectFit: "cover", borderRadius: "4px" };
                              return idx === 0 ? (
                                <img key={idx} src={imgSrc} alt={`Board ${board.title} preview ${idx + 1}`} style={{ ...style, gridRow: "1 / span 2" }} />
                              ) : (
                                <img key={idx} src={imgSrc} alt={`Board ${board.title} preview ${idx + 1}`} style={style} />
                              );
                            })}
                          </Box>

                          <Box sx={{ width: "100%", textAlign: "center", mt: 2, height: "100px", padding: "3%", borderRadius: "8px", backgroundColor: "#ffffff" }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                              {board.isPrivate && (
                                <span role="img" aria-label="private" style={{ fontSize: "16px" }}>🔒</span>
                              )}
                              {board.isArchived && (
                                <span role="img" aria-label="archived" style={{ fontSize: "16px" }}>🗁</span>
                              )}
                              <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, textAlign: "center" }}>
                                {board.title}
                              </Typography>

                              {isOwner && (
                                <Typography
                                  onClick={(e) => { e.stopPropagation(); toggleBoardOptions(board, e); }}
                                  sx={{
                                    position: "absolute",
                                    right: 8,
                                    cursor: "pointer",
                                    fontSize: "20px",
                                    fontWeight: "bold",
                                    userSelect: "none",
                                  }}
                                >
                                  ⋮
                                </Typography>
                              )}
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>by {board.ownerName || "Unknown"}</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {(board.pinsBoard || []).length} Pins | Updated {new Date(board.updatedAt).toLocaleDateString("en-GB").replace(/\//g, ".")}
                            </Typography>
                          </Box>

                        </Box>
                      );
                    })}
                  </Box>
                ) : (
                  <Typography sx={{ mt: 4, textAlign: "center" }}>No boards found</Typography>
                )}

                <BoardOptionsModal
                  isOpen={boardOptionsOpen}
                  onClose={() => setBoardOptionsOpen(false)}
                  board={selectedBoard}
                  position={optionsPosition}
                  onArchiveToggle={() => handleArchiveToggle(selectedBoard)}
                  onPrivacyToggle={() => handlePrivacyToggle(selectedBoard)}
                  onDelete={() => handleDelete(selectedBoard)}
                />
              </>
            )}

            {activeTab === 'Aests' && (
              <>
                {loadingSaved ? (
                  <Box sx={{ textAlign: 'center', mt: 4, color: '#7B8D9B' }}>Loading...</Box>
                ) : savedError ? (
                  <Box sx={{ textAlign: 'center', mt: 4, color: 'crimson' }}>{savedError}</Box>
                ) : savedPins.length === 0 ? (
                  <Box sx={{ textAlign: 'center', color: '#6b7280', py: 6 }}>
                    <Box sx={{ mb: 4 }}>There are no Aests saved yet, let's save the first one!</Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/')}
                        sx={{
                          display: "flex",
                          width: "200px",
                          padding: "12px 20px",
                          alignItems: "center",
                          gap: "12px",
                          borderRadius: "100px",
                          background: "#6F91D9",
                          color: "white",
                          textTransform: "none",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                          "&:hover": { background: "#5A7BC4" }
                        }}
                      >
                        Go explore
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <MasonryGrid pins={savedPins} limitedMenu />
                )}

                <BoardOptionsModal
                  isOpen={boardOptionsOpen}
                  onClose={() => setBoardOptionsOpen(false)}
                  board={selectedBoard}
                  position={optionsPosition}
                  onArchiveToggle={() => handleArchiveToggle(selectedBoard)}
                  onPrivacyToggle={() => handlePrivacyToggle(selectedBoard)}
                  onDelete={() => handleDelete(selectedBoard)}
                />
              </>
            )}

            {activeTab === 'Created' && (
              <>
                {loadingPins ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : normalizedCreatedPins.length === 0 ? (
                  <Typography sx={{ mt: 4, textAlign: "center" }}>No created pins</Typography>
                ) : (
                  <MasonryGrid pins={normalizedCreatedPins} limitedMenu />
                )}
              </>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileBoards;