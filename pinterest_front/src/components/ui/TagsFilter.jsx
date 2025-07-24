import React from "react";
import PropTypes from "prop-types";
import "./TagsFilter.css";

const TagsFilter = ({ tags, activeTag, onTagSelect }) => {
  return (
    <div className="tags-filter">
      {tags.map((tag) => (
        <button
          key={tag}
          className={`tags-filter__btn${activeTag === tag ? " tags-filter__btn--active" : ""}`}
          onClick={() => onTagSelect(activeTag === tag ? null : tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
};

TagsFilter.propTypes = {
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  activeTag: PropTypes.string,
  onTagSelect: PropTypes.func.isRequired,
};

export default TagsFilter;
