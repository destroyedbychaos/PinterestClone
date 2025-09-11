import React from 'react';

const SendIcon = ({ size = 24, color = "#01233F", ...props }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
      {...props}
    >
      <path 
        d="M2.01 21L23 12L2.01 3L2 10L17 12L2 14L2.01 21Z" 
        fill={color}
      />
    </svg>
  );
};

export default SendIcon;
