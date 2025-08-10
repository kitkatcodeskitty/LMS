import React, { useState, useEffect, useRef } from "react";

export default function TextCarousel() {
  const [current, setCurrent] = useState(0);
  const totalSlides = 3;
  const intervalRef = useRef(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % totalSlides);
    }, 3000);
    return () => clearInterval(intervalRef.current);
  }, [totalSlides]);

  // Optional: Add manual navigation (dots)
  const goToSlide = (idx) => setCurrent(idx);

  return (
    <div className="relative w-screen flex flex-col items-center justify-center bg-gray-900 text-white overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ width: `${totalSlides * 100}vw`, transform: `translateX(-${current * 100}vw)` }}
      >
        <div className="w-screen flex items-center justify-center py-6 text-2xl font-bold">
          🚀 Learn Java — From Beginner to Pro
        </div>
        <div className="w-screen flex items-center justify-center py-6 text-2xl font-bold">
          🐍 Master Python — Build Anything You Imagine
        </div>
      </div>
    </div>
  );
}