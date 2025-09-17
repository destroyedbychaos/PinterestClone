import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { logout } from "../../../store/slices/AuthSlice";
import { useNavigate } from "react-router-dom";
import { 
  getUserDisplayName, 
  getUserAvatarInitial, 
  getUserUsername, 
  hasUserAvatar, 
  getUserAvatarUrl
} from "../../utils/userUtils";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import { Box } from "@mui/material";

const SimpleHeader = ({ title }) => {
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
    <div className="flex items-center justify-between w-full pt-8 bg-transparent md:flex-col md:items-stretch md:pt-6 md:gap-3">

            <Box sx={{ display: "flex", justifyContent: "space-between", paddingRight:'40px',paddingTop:'10px'  }}>

            <Box sx={{paddingLeft:'85px' }}>
            <h1
                className="text-black font-bold text-5xl leading-normal md:text-center"
                style={{ fontFamily: "Geologica, sans-serif",
            color: "var(--Dark-900, #000D17)",
            textAlign: "center",
            fontFamily: "Geologica, sans-serif",
            fontSize: "51px",
            fontStyle: "normal",
            fontWeight: 700,
            lineHeight: "normal",
          }}
            >
                {title || "Create Aest"}
            </h1>
            </Box>
            <Box sx={{ paddingLeft:'400px' }}>
            <div className="flex items-center gap-6">
        {currentUser ? (
          <div
            className="flex w-67 h-16 p-2 items-center gap-2 flex-shrink-0 rounded-full border border-blue-200 bg-white cursor-pointer relative"
            ref={profileRef}
            tabIndex={0}
            onClick={() => setShowMenu((v) => !v)}
            style={{ boxSizing: "border-box" }}
          >
            {hasUserAvatar(currentUser) ? (
              <img
                src={getUserAvatarUrl(currentUser)}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eaeff9', borderRadius: '50%', width: 48, height: 48, color: '#6b7280', fontSize: '16px', fontWeight: 600 }}>
                {getUserAvatarInitial(currentUser)}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 ml-2 whitespace-nowrap overflow-hidden text-ellipsis" >
              {getUserDisplayName(currentUser)}
            </span>

            {showMenu && (
              <div
                className="absolute top-18 right-0 min-w-80 bg-white rounded-3xl shadow-2xl p-7 pb-6 z-50 flex flex-col items-center gap-4"
                ref={menuRef}
                tabIndex={-1}
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.13)" }}
              >
                <div className="text-gray-500 text-lg font-medium mb-0.5 self-start">
                  Currently in
                </div>

                <div className="flex items-center gap-4 w-full">
                  {hasUserAvatar(currentUser) ? (
                    <img
                      src={getUserAvatarUrl(currentUser)}
                      alt="avatar"
                      className="w-14 h-14 rounded-full object-cover bg-blue-50"
                    />
                  ) : (
                    <span className="w-14 h-14 rounded-full flex items-center justify-center bg-blue-50 text-gray-500 text-lg font-semibold">
                      {getUserAvatarInitial(currentUser)}
                    </span>
                  )}
                  <div className="flex flex-col gap-0.5">
                    <div className="text-lg font-bold text-gray-900">
                      {getUserDisplayName(currentUser)}
                    </div>
                    <div className="text-base text-gray-500 font-medium">
                      @{getUserUsername(currentUser)}
                    </div>
                  </div>
                </div>

                <div className="text-gray-500 text-lg font-medium self-start mt-2 mb-0.5">
                  Your accounts
                </div>

                <button
                  className="w-full bg-blue-50 text-gray-900 border-none rounded-2xl py-3 px-0 text-lg font-bold mt-1.5 cursor-pointer transition-colors duration-200 hover:bg-blue-100"
                  onClick={() => {
                    setShowMenu(false);
                    navigate("/register");
                  }}
                >
                  Add account
                </button>

                <button
                  className="w-full bg-gray-100 text-red-700 border-none rounded-2xl py-3 px-0 text-lg font-bold cursor-pointer transition-colors duration-200 hover:bg-blue-100"
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
          <div className="flex gap-2.5">
            <button
              className="bg-gray-100 text-gray-800 border-none rounded-2xl py-1.5 px-5 min-w-22 text-base font-medium cursor-pointer transition-colors duration-200 hover:bg-gray-200"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button
              className="bg-indigo-500 text-white border-none rounded-2xl py-1.5 px-5 min-w-22 text-base font-medium cursor-pointer transition-colors duration-200 hover:bg-indigo-700"
              onClick={() => navigate("/register")}
            >
              Sign Up
            </button>
          </div>
        )}
      </div>
            </Box>
        </Box>
    </div>
  );
};

SimpleHeader.propTypes = {
  title: PropTypes.string,
};

export default SimpleHeader;