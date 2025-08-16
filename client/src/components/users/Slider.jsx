import React, { useState, useEffect, useRef } from "react";
import { FiDollarSign, FiTarget, FiTrendingUp } from 'react-icons/fi';

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
          <FiDollarSign className="mr-3 text-green-400" size={32} />
          Current Balance: Check Your Earnings
        </div>
        <div className="w-screen flex items-center justify-center py-6 text-2xl font-bold">
          <FiTarget className="mr-3 text-blue-400" size={32} />
          Withdraw Your Commissions Anytime
        </div>
        <div className="w-screen flex items-center justify-center py-6 text-2xl font-bold">
          <FiTrendingUp className="mr-3 text-purple-400" size={32} />
          Earn 50% Commission on Every Referral
        </div>
      </div>
    </div>
  );
}