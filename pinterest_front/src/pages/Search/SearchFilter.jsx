import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { Box } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import MasonryGrid from "../../components/ui/MasonryGrid";
import TagsFilter from "../../components/ui/TagsFilter";
import SearchHeader from "../../components/layout/SearchHeader";
import SideMenu from "../../components/layout/SideMenu";
import SearchModal from "../../components/SearchModal";
import ImageSearchModal from "../../components/ImageSearchModal";
import SearchFilterModal from "../../components/SearchFilterModal";
import PinViewModal from "../../components/PinViewModal";

const API_BASE = "/api";

const SearchFilter = () => {
  const { user } = useSelector((state) => state.auth);

  const [tags, setTags] = useState([]);
  const [activeTag, setActiveTag] = useState("");
  const [pins, setPins] = useState([]);
  const [hiddenPinIds, setHiddenPinIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageSearchLoading, setImageSearchLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showImageSearch, setShowImageSearch] = useState(false);
  const [showSearchFilterModal, setShowSearchFilterModal] = useState(false);
  const [showPinViewModal, setShowPinViewModal] = useState(false);
  const [selectedPin, setSelectedPin] = useState(null);

  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("query") || "";
    setSearch(query);
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    let url = `${API_BASE}/pins?pageNumber=1&pageSize=40`;
    if (activeTag) url += `&tags=${encodeURIComponent(activeTag.trim().toLowerCase())}`;
    if (search) url += `&searchTerm=${encodeURIComponent(search)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setPins(data.Pins || data.pins || []))
      .catch(() => setPins([]))
      .finally(() => setLoading(false));
  }, [activeTag, search]);

  useEffect(() => {
    fetch(`${API_BASE}/pins/all-tags`)
      .then((res) => res.json())
      .then((data) => setTags(data.slice(0, 6)))
      .catch(() => setTags([]));
  }, []);

  useEffect(() => {
    if (token) {
      fetch(`${API_BASE}/HiddenPins/hidden-ids`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => setHiddenPinIds(data.success && data.payload ? data.payload : []))
        .catch(() => setHiddenPinIds([]));
    } else {
      setHiddenPinIds([]);
    }
  }, [token]);

  const handlePinClick = (pin) => {
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
      prev.filter(
        (pin) =>
          (pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString()) !== pinId
      )
    );
  };

  const displayedPins = pins.filter(
    (pin) =>
      !hiddenPinIds.includes(pin.Id || pin.id || pin.Id?.toString() || pin.id?.toString())
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <SideMenu />
      <Box sx={{ flex: 1 }}>
        <SearchHeader
          user={user}
          onSearch={setSearch}
          searchRef={searchRef}
          onFocusSearch={() => setShowSearchModal(true)}
          onImageSearch={() => {
            setShowImageSearch(true);
            setShowSearchModal(false);
          }}
          onLogin={() => navigate("/login")}
          onSignup={() => navigate("/register")}
        />

        <Box sx={{ p: "0 24px", mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Box
              component="button"
              onClick={() => setShowSearchFilterModal((prev) => !prev)}
              sx={{
                backgroundColor: "#EAEFF9",
                color: "#000D17",
                border: "none",
                borderRadius: "100px",
                padding: "12px 24px",
                fontFamily: "Geologica, sans-serif",
                fontSize: "24px",
                fontWeight: 400,
                lineHeight: 1.2,
                textAlign: "center",
                cursor: "pointer",
                minHeight: "48px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "nowrap",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#d1d9e8",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0)",
                },
                "&.active": {
                  backgroundColor: "#fff",
                  border: "1px solid #CBD7F1",
                  fontWeight: 500,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                },
              }}
            >
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.6667 24.3335C14.6667 24.0683 14.772 23.8139 14.9596 23.6264C15.1471 23.4389 15.4015 23.3335 15.6667 23.3335H27C27.2652 23.3335 27.5196 23.4389 27.7071 23.6264C27.8946 23.8139 28 24.0683 28 24.3335C28 24.5987 27.8946 24.8531 27.7071 25.0406C27.5196 25.2281 27.2652 25.3335 27 25.3335H15.6667C15.4015 25.3335 15.1471 25.2281 14.9596 25.0406C14.772 24.8531 14.6667 24.5987 14.6667 24.3335ZM4 8.3335C4 8.06828 4.10536 7.81393 4.29289 7.62639C4.48043 7.43885 4.73478 7.3335 5 7.3335H15C15.2652 7.3335 15.5196 7.43885 15.7071 7.62639C15.8946 7.81393 16 8.06828 16 8.3335C16 8.59871 15.8946 8.85307 15.7071 9.0406C15.5196 9.22814 15.2652 9.3335 15 9.3335H5C4.73478 9.3335 4.48043 9.22814 4.29289 9.0406C4.10536 8.85307 4 8.59871 4 8.3335ZM21.3333 16.3335C21.3333 16.0683 21.4387 15.8139 21.6262 15.6264C21.8138 15.4389 22.0681 15.3335 22.3333 15.3335H27C27.2652 15.3335 27.5196 15.4389 27.7071 15.6264C27.8946 15.8139 28 16.0683 28 16.3335C28 16.5987 27.8946 16.8531 27.7071 17.0406C27.5196 17.2281 27.2652 17.3335 27 17.3335H22.3333C22.0681 17.3335 21.8138 17.2281 21.6262 17.0406C21.4387 16.8531 21.3333 16.5987 21.3333 16.3335ZM11.6667 21.3335C11.9319 21.3335 12.1862 21.4389 12.3738 21.6264C12.5613 21.8139 12.6667 22.0683 12.6667 22.3335V26.3335C12.6667 26.5987 12.5613 26.8531 12.3738 27.0406C12.1862 27.2281 11.9319 27.3335 11.6667 27.3335C11.4015 27.3335 11.1471 27.2281 10.9596 27.0406C10.772 26.8531 10.6667 26.5987 10.6667 26.3335V22.3335C10.6667 22.0683 10.772 21.8139 10.9596 21.6264C11.1471 21.4389 11.4015 21.3335 11.6667 21.3335Z"
                  fill="#000D17"
                />
                <path
                  d="M4 24.3335C4 24.0683 4.10536 23.8139 4.29289 23.6264C4.48043 23.4389 4.73478 23.3335 5 23.3335H11C11.2652 23.3335 11.5196 23.4389 11.7071 23.6264C11.8946 23.8139 12 24.0683 12 24.3335C12 24.5987 11.8946 24.8531 11.7071 25.0406C11.5196 25.2281 11.2652 25.3335 11 25.3335H5C4.73478 25.3335 4.48043 25.2281 4.29289 25.0406C4.10536 24.8531 4 24.5987 4 24.3335ZM4 16.3335C4 16.0683 4.10536 15.8139 4.29289 15.6264C4.48043 15.4389 4.73478 15.3335 5 15.3335H16.3333C16.5985 15.3335 16.8529 15.4389 17.0404 15.6264C17.228 15.8139 17.3333 16.0683 17.3333 16.3335C17.3333 16.5987 17.228 16.8531 17.0404 17.0406C16.8529 17.2281 16.5985 17.3335 16.3333 17.3335H5C4.73478 17.3335 4.48043 17.2281 4.29289 17.0406C4.10536 16.8531 4 16.5987 4 16.3335ZM22.3333 13.3335C22.5986 13.3335 22.8529 13.4389 23.0404 13.6264C23.228 13.8139 23.3333 14.0683 23.3333 14.3335V18.3335C23.3333 18.5987 23.228 18.8531 23.0404 19.0406C22.8529 19.2281 22.5986 19.3335 22.3333 19.3335C22.0681 19.3335 21.8138 19.2281 21.6262 19.0406C21.4387 18.8531 21.3333 18.5987 21.3333 18.3335V14.3335C21.3333 14.0683 21.4387 13.8139 21.6262 13.6264C21.8138 13.4389 22.0681 13.3335 22.3333 13.3335ZM18.6667 8.3335C18.6667 8.06828 18.772 7.81393 18.9596 7.62639C19.1471 7.43885 19.4015 7.3335 19.6667 7.3335H27C27.2652 7.3335 27.5196 7.43885 27.7071 7.62639C27.8946 7.81393 28 8.06828 28 8.3335C28 8.59871 27.8946 8.85307 27.7071 9.0406C27.5196 9.22814 27.2652 9.3335 27 9.3335H19.6667C19.4015 9.3335 19.1471 9.22814 18.9596 9.0406C18.772 8.85307 18.6667 8.59871 18.6667 8.3335ZM15 5.3335C15.2652 5.3335 15.5196 5.43885 15.7071 5.62639C15.8946 5.81393 16 6.06828 16 6.3335V10.3335C16 10.5987 15.8946 10.8531 15.7071 11.0406C15.5196 11.2281 15.2652 11.3335 15 11.3335C14.7348 11.3335 14.4804 11.2281 14.2929 11.0406C14.1054 10.8531 14 10.5987 14 10.3335V6.3335C14 6.06828 14.1054 5.81393 14.2929 5.62639C14.4804 5.43885 14.7348 5.3335 15 5.3335Z"
                  fill="#000D17"
                />
              </svg>
            </Box>

            <TagsFilter tags={tags} activeTag={activeTag} onTagSelect={setActiveTag} />
          </Box>

          {loading || imageSearchLoading ? (
            <div style={{ textAlign: "center", marginTop: 40 }}>
                              {imageSearchLoading ? "Searching for similar images..." : "Loading..."}
            </div>
          ) : (
            <MasonryGrid
              pins={displayedPins.map((pin) => {
                let image = pin.ImageUrl || pin.imageUrl || pin.image;
                if (image && !/^https?:\/\//.test(image)) {
                  if (!image.startsWith("/")) image = "/images/" + image.replace(/^.*[\\/]/, "");
                }
                return {
                  id: pin.Id || pin.id,
                  image,
                  title: pin.Title || pin.title,
                  description: pin.Description || pin.description,
                  author: pin.UserName || pin.userName || pin.author,
                  tags: (pin.Tags || pin.tags || "").split(",").map((t) => t.trim()).filter(Boolean),
                };
              })}
              onPinHidden={handlePinHidden}
              onPinClick={handlePinClick}
            />
          )}
        </Box>
      </Box>

      <SearchModal
        open={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        recentSearches={recentSearches}
        setRecentSearches={setRecentSearches}
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

      <PinViewModal
        pin={selectedPin}
        isOpen={showPinViewModal}
        onClose={handlePinViewClose}
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

      <SearchFilterModal open={showSearchFilterModal} onClose={() => setShowSearchFilterModal(false)} />
    </Box>
  );
};

export default SearchFilter;
