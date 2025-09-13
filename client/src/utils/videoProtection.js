// Video protection utilities to prevent sharing and unauthorized access

// YouTube URL parameters to disable sharing and branding
export const getProtectedYouTubeUrl = (originalUrl) => {
  if (!originalUrl || !originalUrl.includes('youtube.com') && !originalUrl.includes('youtu.be')) {
    return originalUrl;
  }

  // Extract video ID from various YouTube URL formats
  const videoId = extractYouTubeVideoId(originalUrl);
  if (!videoId) return originalUrl;

  // Build protected URL with balanced parameters (allows playback, prevents sharing)
  const protectedParams = [
    'modestbranding=1',        // Hide YouTube logo
    'rel=0',                   // Don't show related videos
    'showinfo=0',              // Hide video info
    'controls=1',              // Show basic controls only
    'disablekb=1',             // Disable keyboard controls
    'fs=0',                    // Disable fullscreen
    'cc_load_policy=0',        // Disable closed captions
    'iv_load_policy=3',        // Hide video annotations
    'autohide=1',              // Auto-hide controls
    'playsinline=1',           // Play inline on mobile
    'enablejsapi=0',           // Disable JavaScript API
    'origin=' + window.location.origin, // Restrict origin
    'widget_referrer=' + window.location.origin, // Restrict referrer
    'html5=1',                 // Force HTML5 player
    'wmode=opaque',            // Prevent overlay issues
    'allowfullscreen=0',       // Disable fullscreen
    'allowscriptaccess=never', // Disable script access
    'allowNetworking=all', // Allow necessary networking for video playback
    'hl=en',                   // English interface
    'cc_lang_pref=en',         // English captions
  ].join('&');

  return `https://www.youtube.com/embed/${videoId}?${protectedParams}`;
};

// Extract YouTube video ID from various URL formats
export const extractYouTubeVideoId = (url) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }
  return null;
};

// Video protection configuration
export const videoProtectionConfig = {
  // Disable right-click context menu
  disableContextMenu: true,
  
  // Disable text selection
  disableTextSelection: true,
  
  // Disable drag and drop
  disableDragDrop: true,
  
  // Disable keyboard shortcuts
  disableKeyboardShortcuts: true,
  
  // Disable fullscreen
  disableFullscreen: true,
  
  // Disable picture-in-picture
  disablePictureInPicture: true,
};

// Apply protection to video container
export const applyVideoProtection = (container) => {
  if (!container) return;

  // Disable context menu
  if (videoProtectionConfig.disableContextMenu) {
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Disable text selection
  if (videoProtectionConfig.disableTextSelection) {
    container.style.userSelect = 'none';
    container.style.webkitUserSelect = 'none';
    container.style.mozUserSelect = 'none';
    container.style.msUserSelect = 'none';
  }

  // Disable drag and drop
  if (videoProtectionConfig.disableDragDrop) {
    container.addEventListener('dragstart', (e) => {
      e.preventDefault();
      return false;
    });
    
    container.addEventListener('drop', (e) => {
      e.preventDefault();
      return false;
    });
  }

  // Disable keyboard shortcuts
  if (videoProtectionConfig.disableKeyboardShortcuts) {
    container.addEventListener('keydown', (e) => {
      // Disable common video shortcuts
      const disabledKeys = [
        'F11',           // Fullscreen
        'Space',         // Play/Pause
        'ArrowLeft',     // Seek backward
        'ArrowRight',    // Seek forward
        'ArrowUp',       // Volume up
        'ArrowDown',     // Volume down
        'M',             // Mute
        'F',             // Fullscreen
        'C',             // Captions
        'T',             // Theater mode
      ];
      
      if (disabledKeys.includes(e.key)) {
        e.preventDefault();
        return false;
      }
    });
  }

  // Disable fullscreen
  if (videoProtectionConfig.disableFullscreen) {
    container.addEventListener('fullscreenchange', (e) => {
      if (document.fullscreenElement === container) {
        document.exitFullscreen();
      }
    });
  }

  // Disable picture-in-picture
  if (videoProtectionConfig.disablePictureInPicture) {
    container.addEventListener('enterpictureinpicture', (e) => {
      e.preventDefault();
      return false;
    });
  }
};

// CSS styles for video protection
export const videoProtectionStyles = `
  .video-protected {
    position: relative;
    user-select: none;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    overflow: hidden;
  }
  
  .video-protected iframe {
    pointer-events: auto;
    border: none;
    outline: none;
    position: relative;
    z-index: 1;
  }
  
  .video-protected::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2;
    pointer-events: none;
    background: transparent;
  }
  
  /* Hide YouTube branding and sharing elements */
  .video-protected iframe[src*="youtube.com"] {
    filter: contrast(1.05) brightness(1.02);
    -webkit-filter: contrast(1.05) brightness(1.02);
  }
  
  /* Completely hide YouTube share button and menu */
  .video-protected iframe[src*="youtube.com"]::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 3;
    pointer-events: auto;
    background: transparent;
  }
  
  /* Hide all YouTube UI elements */
  .video-protected iframe[src*="youtube.com"] {
    -webkit-filter: contrast(1.1) brightness(1.05) saturate(0.9);
    filter: contrast(1.1) brightness(1.05) saturate(0.9);
  }
  
  /* Disable video controls overlay */
  .video-protected iframe[src*="youtube.com"]::-webkit-media-controls {
    display: none !important;
  }
  
  /* Prevent video download */
  .video-protected iframe[src*="youtube.com"]::-webkit-media-controls-enclosure {
    display: none !important;
  }
  
  /* Hide video info overlay */
  .video-protected iframe[src*="youtube.com"]::-webkit-media-controls-panel {
    display: none !important;
  }
  
  /* Hide YouTube share button specifically */
  .video-protected iframe[src*="youtube.com"]::-webkit-media-controls-overlay-play-button {
    display: none !important;
  }
  
  /* Additional protection for YouTube elements */
  .video-protected iframe[src*="youtube.com"] {
    clip-path: inset(0 0 0 0);
    -webkit-clip-path: inset(0 0 0 0);
  }
  
  /* Prevent any YouTube popups or modals */
  .video-protected iframe[src*="youtube.com"] {
    overflow: hidden;
  }
  
  /* Hide YouTube title bar and info */
  .video-protected iframe[src*="youtube.com"] {
    -webkit-mask: linear-gradient(black, black);
    mask: linear-gradient(black, black);
  }
  
  /* Completely hide YouTube share button and menu */
  .video-protected iframe[src*="youtube.com"] {
    overflow: hidden;
  }
  
  /* Hide YouTube share button and related videos only */
  .video-protected iframe[src*="youtube.com"]::-webkit-media-controls-fullscreen-button {
    display: none !important;
  }
`;

// Create protected iframe element
export const createProtectedIframe = (url, title, className = '') => {
  const iframe = document.createElement('iframe');
  iframe.src = getProtectedYouTubeUrl(url);
  iframe.title = title;
  iframe.className = `w-full h-full ${className}`;
  iframe.frameBorder = '0';
  iframe.allowFullScreen = false;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.sandbox = 'allow-scripts allow-same-origin allow-presentation';
  
  return iframe;
};

// Initialize video protection for all video containers
export const initializeVideoProtection = () => {
  const videoContainers = document.querySelectorAll('.video-protected');
  videoContainers.forEach(container => {
    applyVideoProtection(container);
  });
};

// Monitor for new video containers and apply protection
export const monitorVideoContainers = () => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const videoContainers = node.querySelectorAll ? 
            node.querySelectorAll('.video-protected') : 
            (node.classList && node.classList.contains('video-protected') ? [node] : []);
          
          videoContainers.forEach(container => {
            applyVideoProtection(container);
          });
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

export default {
  getProtectedYouTubeUrl,
  extractYouTubeVideoId,
  videoProtectionConfig,
  applyVideoProtection,
  videoProtectionStyles,
  createProtectedIframe,
  initializeVideoProtection,
  monitorVideoContainers
};
