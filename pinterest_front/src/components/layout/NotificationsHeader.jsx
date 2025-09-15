import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./DiscoverHeader.css";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import {
  getUserDisplayName,
  getUserAvatarInitial,
  getUserUsername,
  hasUserAvatar,
  getUserAvatarUrl,
} from "../../utils/userUtils";
import { useCurrentUser } from "../../hooks/useCurrentUser";

const NotificationsHeader = ({ user, title, onOpenNotifications }) => {
  const [showMenu, setShowMenu] = useState(false);

  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const currentUser = useCurrentUser();

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
      <span className="discover-header__title">{title || "Your profile"}</span>
      <div className="discover-header__spacer" />
      <div className="discover-header__right">
        {currentUser ? (
          <div
            className="discover-header__profile"
            ref={profileRef}
            tabIndex={0}
            onClick={() => setShowMenu((v) => !v)}
            style={{ position: "relative", cursor: "pointer" }}
          >
            {hasUserAvatar(currentUser) ? (
              <img
                src={getUserAvatarUrl(currentUser)}
                alt="avatar"
                className="discover-header__avatar-img"
              />
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48, color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                {getUserAvatarInitial(currentUser)}
              </span>
            )}
            <span className="discover-header__profile-name">
              {getUserDisplayName(currentUser)}
            </span>
            {showMenu && (
              <div
                className="profile-dropdown-menu"
                ref={menuRef}
                tabIndex={-1}
              >
                <div className="profile-dropdown-menu__current">
                  Currently in
                </div>
                <div className="profile-dropdown-menu__user">
                  {hasUserAvatar(currentUser) ? (
                    <img
                      src={getUserAvatarUrl(currentUser)}
                      alt="avatar"
                      className="profile-dropdown-menu__avatar"
                    />
                  ) : (
                    <span
                      className="profile-dropdown-menu__avatar"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eaeff9",
                        borderRadius: "50%",
                        width: 56,
                        height: 56,
                        color: "#6b7280",
                        fontSize: "18px",
                        fontWeight: 600,
                      }}
                    >
                      {getUserAvatarInitial(currentUser)}
                    </span>
                  )}
                  <div className="profile-dropdown-menu__info">
                    <div className="profile-dropdown-menu__name">
                      {getUserDisplayName(currentUser)}
                    </div>
                    <div className="profile-dropdown-menu__username">
                      @{getUserUsername(currentUser)}
                    </div>
                  </div>
                </div>
                <div className="profile-dropdown-menu__accounts">
                  Your accounts
                </div>
                <button
                  className="profile-dropdown-menu__btn"
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/register");
                  }}
                >
                  Add account
                </button>
                <button
                  className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout"
                  onClick={() => {
                    dispatch(logout());
                    setShowMenu(false);
                    window.location.reload();
                  }}
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="discover-header__auth-buttons">
            <button
              className="discover-header__login-btn"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="discover-header__signup-btn"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

NotificationsHeader.propTypes = {
  user: PropTypes.object,
  title: PropTypes.string,
  onOpenNotifications: PropTypes.func,
};

export default NotificationsHeader;
