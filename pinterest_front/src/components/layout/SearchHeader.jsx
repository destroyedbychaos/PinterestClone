import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import "./DiscoverHeader.css";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';

const SearchHeader = ({ user, onSearch, onLogin, onSignup, onFocusSearch, searchRef, onImageSearch, title }) => {
  const [showMenu, setShowMenu] = useState(false);
  const profileRef = useRef(null);
  const menuRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

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
      <svg
        width="34"
        height="27"
        viewBox="0 0 36 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
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
          <span className="discover-header__search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ width: 24, height: 24, flexShrink: 0, aspectRatio: "1/1" }}>
              <path d="M10.25 2C11.818 1.99983 13.3535 2.44648 14.6767 3.28763C16 4.12878 17.0561 5.3296 17.7214 6.74941C18.3867 8.16922 18.6337 9.74922 18.4333 11.3043C18.2329 12.8594 17.5935 14.3252 16.59 15.53L22.28 21.22C22.3787 21.3117 22.4509 21.4283 22.4889 21.5575C22.5269 21.6868 22.5294 21.8239 22.496 21.9544C22.4626 22.0849 22.3947 22.204 22.2993 22.2992C22.2039 22.3943 22.0846 22.462 21.954 22.495C21.8236 22.5283 21.6867 22.5259 21.5575 22.4881C21.4284 22.4503 21.3118 22.3784 21.22 22.28L15.53 16.59C14.5118 17.4378 13.3045 18.0278 12.01 18.3103C10.7156 18.5928 9.37216 18.5594 8.09337 18.2128C6.81459 17.8663 5.63807 17.2169 4.66333 16.3195C3.6886 15.4222 2.94432 14.3033 2.49347 13.0574C2.04261 11.8116 1.89843 10.4755 2.07314 9.16216C2.24784 7.84883 2.73627 6.59689 3.49713 5.51224C4.25799 4.42759 5.26889 3.54214 6.44431 2.93079C7.61973 2.31944 8.92511 2.00017 10.25 2ZM3.50001 10.25C3.50001 11.1364 3.6746 12.0142 4.01382 12.8331C4.35304 13.6521 4.85024 14.3962 5.47704 15.023C6.10384 15.6498 6.84795 16.147 7.6669 16.4862C8.48585 16.8254 9.36359 17 10.25 17C11.1364 17 12.0142 16.8254 12.8331 16.4862C13.6521 16.147 14.3962 15.6498 15.023 15.023C15.6498 14.3962 16.147 13.6521 16.4862 12.8331C16.8254 12.0142 17 11.1364 17 10.25C17 8.45979 16.2889 6.7429 15.023 5.47703C13.7571 4.21116 12.0402 3.5 10.25 3.5C8.4598 3.5 6.74291 4.21116 5.47704 5.47703C4.21117 6.7429 3.50001 8.45979 3.50001 10.25Z" fill="#52697C" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search your Aests"
            className="discover-header__search-input"
            onChange={e => onSearch(e.target.value)}
            onFocus={() => {
              onFocusSearch();
            }}
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
              <span className="discover-header__avatar-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48 }}>
              </span>
            )}
            <span className="discover-header__profile-name">
              {user.displayName || user.userName || user.email}
            </span>
            {showMenu && (
              <div className="profile-dropdown-menu" ref={menuRef} tabIndex={-1}>
                <div className="profile-dropdown-menu__current">Currently in</div>
                <div className="profile-dropdown-menu__user">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="profile-dropdown-menu__avatar" />
                  ) : (
                    <span className="profile-dropdown-menu__avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 56, height: 56 }}>
                    </span>
                  )}
                  <div className="profile-dropdown-menu__info">
                    <div className="profile-dropdown-menu__name">{user.displayName || user.userName || user.email}</div>
                    <div className="profile-dropdown-menu__username">@{user.userName || user.displayName || user.email}</div>
                  </div>
                </div>
                <div className="profile-dropdown-menu__accounts">Your accounts</div>
                <button className="profile-dropdown-menu__btn" onClick={() => { setShowMenu(false); navigate('/register'); }}>Add account</button>
                <button className="profile-dropdown-menu__btn profile-dropdown-menu__btn--logout" onClick={() => { dispatch(logout()); setShowMenu(false); window.location.reload(); }}>Log out</button>
              </div>
            )}
          </div>
        ) : (
          <div className="discover-header__auth-buttons">
            <button className="discover-header__login-btn" onClick={() => navigate('/login')}>Login</button>
            <button className="discover-header__signup-btn" onClick={() => navigate('/register')}>Sign Up</button>
          </div>
        )}
      </div>
    </div>
  );
};

SearchHeader.propTypes = {
  user: PropTypes.object,
  onSearch: PropTypes.func,
  onLogin: PropTypes.func,
  onSignup: PropTypes.func,
  onFocusSearch: PropTypes.func,
  searchRef: PropTypes.object,
  title: PropTypes.string,
};

export default SearchHeader;
