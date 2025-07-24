import React from "react";
import PropTypes from "prop-types";
import "./PinCard.css";

const PinCard = ({ image, title, description, author, tags, height }) => {
  return (
    <div
      className="pin-card"
      style={{
        alignSelf: "stretch",
        borderRadius: 40,
        position: "relative",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        overflow: "hidden",
        background: "#eee"
      }}
    >
      <img
        src={image}
        alt={title}
        className="pin-card__image"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          borderRadius: 40,
          display: "block"
        }}
        onError={e => { e.target.style.background = '#eee'; e.target.src = ''; }}
      />
    </div>
  );
};

PinCard.propTypes = {
  image: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  author: PropTypes.string,
  tags: PropTypes.arrayOf(PropTypes.string),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default PinCard;
