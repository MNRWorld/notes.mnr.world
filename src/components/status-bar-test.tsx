"use client";

import { useEffect, useState } from "react";

export function StatusBarTest() {
  const [statusInfo, setStatusInfo] = useState({
    satValue: "0px",
    sabValue: "0px",
    bodyPaddingTop: "0px", 
    bodyPaddingBottom: "0px",
    windowHeight: 0,
  });

  useEffect(() => {
    const updateInfo = () => {
      const htmlStyle = getComputedStyle(document.documentElement);
      const bodyStyle = getComputedStyle(document.body);
      
      setStatusInfo({
        satValue: htmlStyle.getPropertyValue("--sat") || "0px",
        sabValue: htmlStyle.getPropertyValue("--sab") || "0px",
        bodyPaddingTop: bodyStyle.paddingTop || "0px",
        bodyPaddingBottom: bodyStyle.paddingBottom || "0px",
        windowHeight: window.innerHeight,
      });
    };

    updateInfo();
    window.addEventListener("resize", updateInfo);
    window.addEventListener("orientationchange", updateInfo);
    
    return () => {
      window.removeEventListener("resize", updateInfo);
      window.removeEventListener("orientationchange", updateInfo);
    };
  }, []);

  // Only show in development mode
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded font-mono z-50 max-w-xs">
      <div className="text-green-400 font-bold mb-1">📱 Status Bar Test</div>
      <div>--sat: {statusInfo.satValue}</div>
      <div>--sab: {statusInfo.sabValue}</div>
      <div>Body Top: {statusInfo.bodyPaddingTop}</div>
      <div>Body Bottom: {statusInfo.bodyPaddingBottom}</div>
      <div>Window H: {statusInfo.windowHeight}px</div>
    </div>
  );
}
