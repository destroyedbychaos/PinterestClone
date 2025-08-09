import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { Box, Avatar, Button } from "@mui/material";
import ProfileHeader from "../../components/layout/ProfileHeader";
import SideMenu from "../../components/layout/SideMenu";
import MasonryGrid from "../../components/ui/MasonryGrid";
import defaultBanner from "../../assets/images/sky.png";
import defaultAvatar from "../../assets/images/noImgUser.png";

const API_BASE = "/api";

const ProfileBoards = () => {
  const authState = useSelector((state) => state.auth);
  const searchRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("Aests"); 
  const [pins, setPins] = useState([]);
  const [loadingPins, setLoadingPins] = useState(false);
  const [boards, setBoards] = useState([]);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const token = useMemo(() => localStorage.getItem("token"), [authState?.token]);

  const handleSearch = () => {};


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

  const normalizedPins = useMemo(() => {
    return pins.map((pin) => {
      let image = pin.ImageUrl || pin.imageUrl || pin.image;
      if (image && !/^https?:\/\//.test(image)) {
        if (!image.startsWith("/")) image = "/images/" + image.replace(/^.*[\\/]/, "");
      }
      return {
        id: pin.Id || pin.id,
        image,
        title: pin.Title || pin.title,
        description: pin.Description || pin.description,
        author: pin.UserName || pin.userName || profile?.displayName || profile?.userName,
        tags: (pin.Tags || pin.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
      };
    });
  }, [pins, profile]);

  const bannerUrl = profile?.bannerUrl || defaultBanner;
  const avatarUrl = profile?.avatarUrl || defaultAvatar;
  const displayName = profile?.displayName || profile?.userName || authState?.user?.email || "User";
  const username = profile?.userName || profile?.displayName || "";

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <Box>
        <SideMenu />
      </Box>

      <Box sx={{ flex: 1 }}>
        <ProfileHeader user={authState?.user} onSearch={handleSearch} searchRef={searchRef} onFocusSearch={() => {}} />

 
        <Box sx={{ px: 4, pt: 2 }}>
          <Box
            sx={{
              width: "100%",
              height: 180,
              borderRadius: 4,
              backgroundImage: `url(${bannerUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />


          <Box sx={{ display: "flex", alignItems: "center", mt: -6, px: 2 }}>
            <Avatar
              src={avatarUrl}
              alt="avatar"
              sx={{ width: 112, height: 112, border: "6px solid #fff", boxShadow: 2 }}
            />
            <Box sx={{ ml: 2, flex: 1 }}>
              <Box sx={{ fontSize: 24, fontWeight: 800 }}>{displayName}</Box>
              <Box sx={{ color: "#6b7280", fontSize: 14, mt: 0.2 }}>@{username}</Box>
              <Box sx={{ color: "#111827", fontSize: 14, mt: 1, fontWeight: 600 }}>
                {(profile?.followersCount ?? 0)} followers · {(profile?.followingCount ?? 0)} following
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              sx={{ textTransform: "none", borderRadius: 8, px: 2.2, py: 1, bgcolor: "#F3F6FF", borderColor: "#CBD7F1", color: "#111827",
                '&:hover': { bgcolor: "#E9F0FF", borderColor: "#B9C9EF" }
              }}
              onClick={() => { }}
            >
              Edit profile
            </Button>
          </Box>


          <Box sx={{ display: "flex", gap: 1.5, mt: 3, px: 2 }}>
            {["Aests", "Boards", "Created"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                variant={activeTab === tab ? "contained" : "text"}
                sx={{
                  textTransform: "none",
                  borderRadius: 6,
                  px: 2,
                  py: 1,
                  boxShadow: activeTab === tab ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
                  bgcolor: activeTab === tab ? "#EAEFF9" : "transparent",
                  color: "#111827",
                  border: activeTab === tab ? "1px solid #CBD7F1" : "1px solid transparent",
                  '&:hover': { bgcolor: "#EAEFF9" },
                }}
              >
                {tab}
              </Button>
            ))}
          </Box>


          <Box sx={{ mt: 2, pb: 6 }}>
            {activeTab === "Aests" && (
              <>
                {loadingProfile || loadingPins ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : (
                  <MasonryGrid pins={normalizedPins} onPinHidden={() => {}} />
                )}
              </>
            )}

            {activeTab === "Boards" && (
              <>
                {loadingProfile || loadingBoards ? (
                  <Box sx={{ textAlign: "center", mt: 4, color: "#7B8D9B" }}>Loading...</Box>
                ) : (
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2 }}>
                    {boards.map((b) => (
                      <Box key={b.Id || b.id} sx={{ p: 2, border: "1px solid #eee", borderRadius: 2 }}>
                        <Box sx={{ fontWeight: 600 }}>{b.Name || b.name}</Box>
                        <Box sx={{ color: "#6b7280", fontSize: 13 }}>{b.Description || b.description || ""}</Box>
                      </Box>
                    ))}
                    {boards.length === 0 && (
                      <Box sx={{ textAlign: "center", color: "#6b7280", py: 6 }}>No boards yet</Box>
                    )}
                  </Box>
                )}
              </>
            )}

            {activeTab === "Created" && (
              <Box sx={{ textAlign: "center", color: "#6b7280", py: 6 }}>Nothing created yet</Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileBoards;
