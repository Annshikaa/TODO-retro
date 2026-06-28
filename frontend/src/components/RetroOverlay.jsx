import React, { useEffect, useState } from 'react';

export default function RetroOverlay() {
  const [scanlines, setScanlines] = useState(localStorage.getItem('retroScanlines') !== 'false');

  useEffect(() => {
    // Listen for custom settings update events to sync live without reloads
    const handleSettingsChange = () => {
      setScanlines(localStorage.getItem('retroScanlines') !== 'false');
    };
    
    window.addEventListener('storage', handleSettingsChange);
    window.addEventListener('crtSettingsChanged', handleSettingsChange);
    
    return () => {
      window.removeEventListener('storage', handleSettingsChange);
      window.removeEventListener('crtSettingsChanged', handleSettingsChange);
    };
  }, []);

  if (!scanlines) return null;

  return (
    <>
      <div className="crt-scanlines" />
      <div className="crt-glow" />
    </>
  );
}
