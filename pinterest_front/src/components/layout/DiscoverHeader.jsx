import React from "react";
import PropTypes from "prop-types";
import "./DiscoverHeader.css";
import ProfileHeader from "./ProfileHeader";

const DiscoverHeader = ({ user, onSearch, onLogin, onSignup, onFocusSearch, searchRef, onImageSearch }) => {

  return (
    <ProfileHeader
      user={user}
      onSearch={onSearch}
      onLogin={onLogin}
      onSignup={onSignup}
      onFocusSearch={onFocusSearch}
      searchRef={searchRef}
      onImageSearch={onImageSearch}
      title="Discover"
    />
  );
};

DiscoverHeader.propTypes = {
  user: PropTypes.object,
  onSearch: PropTypes.func,
  onLogin: PropTypes.func,
  onSignup: PropTypes.func,
  onFocusSearch: PropTypes.func,
  searchRef: PropTypes.object,
};

export default DiscoverHeader;
