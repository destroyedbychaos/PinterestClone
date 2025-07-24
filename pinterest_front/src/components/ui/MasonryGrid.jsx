import React from "react";
import PinCard from "./PinCard";
import "./MasonryGrid.css";

const MasonryGrid = ({ pins }) => {
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
        />
      ))}
    </div>
  );
};

export default MasonryGrid;
