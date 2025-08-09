import React, { useRef } from "react";
import { useSelector } from "react-redux";
import ProfileHeader from "../../components/layout/ProfileHeader";
import SideMenu from "../../components/layout/SideMenu";
import { Box } from "@mui/material";

const ProfileBoards = () => {
  const user = useSelector((state) => state.auth.user);
  const searchRef = useRef(null);

  const handleSearch = (value) => {
    console.log("Search:", value);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#fff" }}>
      <Box>
        <SideMenu />
      </Box>

      <Box sx={{ flex: 1 }}>
        <ProfileHeader user={user} onSearch={handleSearch} searchRef={searchRef} />
      </Box>
    </Box>
  );
};

export default ProfileBoards;
