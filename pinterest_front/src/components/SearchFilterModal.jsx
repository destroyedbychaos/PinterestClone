import React, { useState } from "react";
import { Box, Radio, RadioGroup, FormControlLabel, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const SearchFilterModal = ({ value, onChange, open, onClose }) => {
  const [selected, setSelected] = useState(value || "all");
  const navigate = useNavigate();

  if (!open) return null;

  const handleChange = (event) => {
    const newValue = event.target.value;
    setSelected(newValue);

    if (onChange) onChange(newValue);

    if (newValue === "profiles") {
      navigate("/search-profile");
      if (onClose) onClose();
    } else if (newValue === "all") {
      navigate("/search-filter");
      if (onClose) onClose();
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        zIndex: 1000,
        mt: "200px",
        ml: "150px",
      }}
      onClick={onClose}
    >
      <Box
        sx={{
          background: "#fff",
          borderRadius: "40px",
          boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
          padding: "24px 32px",
          minWidth: "220px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transition: "all 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <RadioGroup value={selected} onChange={handleChange} sx={{ width: "100%" }}>
          {["all", "boards", "profiles"].map((item) => (
            <FormControlLabel
              key={item}
              value={item}
              control={<Radio sx={{ color: "#6F91D9" }} />}
              label={
                <Typography
                  sx={{
                    fontWeight: 600,
                    textAlign: "center",
                    width: "100%",
                  }}
                >
                  {item === "all"
                    ? "All Aests"
                    : item.charAt(0).toUpperCase() + item.slice(1)}
                </Typography>
              }
              sx={{ justifyContent: "center", marginY: 1 }}
            />
          ))}
        </RadioGroup>
      </Box>
    </Box>
  );
};

export default SearchFilterModal;
