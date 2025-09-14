import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./DiscoverHeader.css";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../store/slices/AuthSlice";
import { getUserAvatarInitial } from "../../utils/userUtils";

const SearchHeader = ({ onSearch, onFocusSearch, searchRef, title }) => {
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

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
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMenu]);

  return (
    <div className="discover-header">
      <button
        onClick={() => navigate(-1)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          padding: 0,
          marginRight: "8px"
        }}
      >
        <svg width="34" height="27" viewBox="0 0 36 29" fill="none">
          <path
            d="M15.5606 28.0601C15.2794 28.341 14.8981 28.4988 14.5006 28.4988C14.1031 28.4988 13.7219 28.341 13.4406 28.0601L0.940633 15.5601C0.659732 15.2789 0.501953 14.8976 0.501953 14.5001C0.501953 14.1026 0.659732 13.7214 0.940633 13.4401L13.4406 0.940116C13.624 0.742667 13.8572 0.598324 14.1157 0.522296C14.3742 0.446268 14.6484 0.441368 14.9094 0.508115C15.1705 0.574861 15.4087 0.710783 15.599 0.901557C15.7893 1.09233 15.9246 1.3309 15.9906 1.59212C16.0572 1.85288 16.0525 2.12676 15.9768 2.38505C15.9012 2.64333 15.7574 2.87651 15.5606 3.06012L5.62063 13.0001H34.5006C34.8985 13.0001 35.28 13.1582 35.5613 13.4395C35.8426 13.7208 36.0006 14.1023 36.0006 14.5001C36.0006 14.8979 35.8426 15.2795 35.5613 15.5608C35.28 15.8421 34.8985 16.0001 34.5006 16.0001H5.62063L15.5606 25.9401C15.8415 26.2214 15.9993 26.6026 15.9993 27.0001C15.9993 27.3976 15.8415 27.7789 15.5606 28.0601Z"
            fill="#01233F"
          />
        </svg>
      </button>
      <span className="discover-header__title">{title || 'Search'}</span>
      <div className="discover-header__spacer" />
      <div className="discover-header__right">
        <div className="discover-header__search" ref={searchRef}>
          <input
            type="text"
            placeholder="Search your Aests"
            className="discover-header__search-input"
            onChange={e => onSearch(e.target.value)}
            onFocus={onFocusSearch}
          />
        </div>

        {user ? (
          <div
            className="discover-header__profile"
            ref={profileRef}
            tabIndex={0}
            onClick={() => setShowMenu(v => !v)}
            style={{ position: "relative", cursor: "pointer" }}
          >
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="discover-header__avatar-img" />
            ) : (
              <span className="img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48, color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                {getUserAvatarInitial(user)}
              </span>
            )}
            <span className="discover-header__profile-name">{user.displayName || user.userName || user.email}</span>
            {showMenu && (
              <div className="profile-dropdown-menu" ref={menuRef}>
                <button onClick={() => { dispatch(logout()); setShowMenu(false); window.location.reload(); }}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="discover-header__auth-buttons">
            <button onClick={() => navigate('/login')}>Login</button>
            <button onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
};

SearchHeader.propTypes = {
  onSearch: PropTypes.func,
  onFocusSearch: PropTypes.func,
  searchRef: PropTypes.object,
  title: PropTypes.string,
};

export default SearchHeader;