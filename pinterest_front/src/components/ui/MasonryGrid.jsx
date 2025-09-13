import React from "react";
import PinCard from "./PinCard";
import "./MasonryGrid.css";

const MasonryGrid = ({ pins, onPinHidden, limitedMenu, hideSaveButton, disableUnsave, onPinClick }) => {
  const heights = [267, 412];
  return (
    <div className="masonry-grid">
      {pins.map((pin, idx) => (
        <PinCard
          key={pin.id}
          image={pin.image}
          title={pin.title}
          description={pin.description}
          author={pin.author}
          tags={pin.tags}
          height={heights[idx % heights.length]}
          pinId={pin.id}
          onPinHidden={onPinHidden}
          limitedMenu={limitedMenu}
          hideSaveButton={hideSaveButton}
          disableUnsave={disableUnsave}
          onPinClick={onPinClick}
        />
      ))}
    </div>
  );
};

export default MasonryGrid;
