import React, { useState, useEffect } from 'react';
import { assets } from '../../assets/assets';

const Popup = ({ popup, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (popup) {
      // Check if user has already seen this popup in current session
      const popupSeenKey = `popup_seen_${popup._id}`;
      const hasSeenPopup = sessionStorage.getItem(popupSeenKey);
      
      if (!hasSeenPopup) {
        // Mark this popup as seen for current session
        sessionStorage.setItem(popupSeenKey, 'true');
        
        // Small delay to ensure smooth animation start
        setTimeout(() => {
          setIsVisible(true);
        }, 100);
        
        // Auto-hide after display duration (minimum 6 seconds for better visibility)
        const displayTime = Math.max(popup.displayDuration || 4000, 6000);
        const timer = setTimeout(() => {
          handleClose();
        }, displayTime);

        return () => clearTimeout(timer);
      } else {
        // User has already seen this popup in this session, don't show it
        setIsVisible(false);
      }
    } else {
      setIsVisible(false);
    }
  }, [popup]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for animation to complete before calling onClose
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };



  if (!popup || !isVisible) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black transition-opacity duration-700 ease-out ${
          isClosing ? 'opacity-0' : isVisible ? 'opacity-70' : 'opacity-0'
        }`}
        onClick={handleClose}
      />
      
              {/* Popup Content - Styled like reference image */}
        <div 
          className={`relative bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4 transform transition-all duration-700 ease-out ${
            isClosing 
              ? 'scale-95 opacity-0 translate-y-4' 
              : isVisible
                ? 'scale-100 opacity-100 translate-y-0'
                : 'scale-95 opacity-0 translate-y-4'
          }`}
        >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all duration-300 ease-out z-10 shadow-lg hover:scale-110"
        >
          <img src={assets.cross_icon} alt="Close" className="w-3 h-3" />
        </button>
        

        

        
        {/* Main Content - Just the Image */}
        <div>
          {/* Popup Image - Only Content */}
          {popup.imageUrl && (
            <img
              src={popup.imageUrl}
              alt="Popup Image"
              className="w-full h-auto object-contain max-h-screen rounded-xl"
              style={{ maxWidth: '100%' }}
            />
          )}
          

        </div>
      </div>
    </div>
  );
};

export default Popup;
