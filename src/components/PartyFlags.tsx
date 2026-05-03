import React from "react";

export const DMKFlag = () => (
  <svg viewBox="0 0 600 400" className="w-full h-full">
    <rect width="600" height="200" fill="#ff0000" />
    <rect y="200" width="600" height="200" fill="#000000" />
  </svg>
);

export const AIADMKFlag = () => (
  <svg viewBox="0 0 600 400" className="w-full h-full">
    <rect width="600" height="200" fill="#000000" />
    <rect y="200" width="600" height="200" fill="#ff0000" />
    <circle cx="300" cy="200" r="60" fill="white" />
    <text x="300" y="215" fontSize="40" textAnchor="middle" fill="black" fontWeight="bold">A</text>
  </svg>
);

export const TVKFlag = () => (
  <svg viewBox="0 0 600 400" className="w-full h-full">
    {/* Top Maroon Band */}
    <rect width="600" height="100" fill="#800000" />
    {/* Middle Yellow Band */}
    <rect y="100" width="600" height="200" fill="#ffff00" />
    {/* Bottom Maroon Band */}
    <rect y="300" width="600" height="100" fill="#800000" />
    
    {/* Central Symbol Area */}
    <g transform="translate(300, 200)">
      {/* Left Elephant (Simplified) */}
      <path d="M-150,0 Q-150,-40 -120,-40 Q-90,-40 -90,0 Q-90,20 -110,30 L-130,30 Q-150,20 -150,0 Z" fill="#800000" />
      <rect x="-145" y="10" width="10" height="25" fill="#800000" />
      <rect x="-105" y="10" width="10" height="25" fill="#800000" />
      
      {/* Right Elephant (Simplified) */}
      <path d="M150,0 Q150,-40 120,-40 Q90,-40 90,0 Q90,20 110,30 L130,30 Q150,20 150,0 Z" fill="#800000" />
      <rect x="135" y="10" width="10" height="25" fill="#800000" />
      <rect x="95" y="10" width="10" height="25" fill="#800000" />

      {/* Central Star */}
      <path d="M0,-40 L10,-10 L40,0 L10,10 L0,40 L-10,10 L-40,0 L-10,-10 Z" fill="#800000" />
    </g>
  </svg>
);

export const BJPFlag = () => (
  <svg viewBox="0 0 600 400" className="w-full h-full">
    <rect width="200" height="400" fill="#ff9933" />
    <rect x="200" width="200" height="400" fill="#ffffff" />
    <rect x="400" width="200" height="400" fill="#138808" />
    <path d="M300 150 C330 150 350 180 350 210 C350 260 300 290 300 290 C300 290 250 260 250 210 C250 180 270 150 300 150 Z" fill="#ff9933" stroke="#000000" strokeWidth="2" />
  </svg>
);
