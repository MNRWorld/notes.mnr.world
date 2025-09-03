"use client";

import React, { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";

export const StatusBarDebugger: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState({
    isNative: false,
    statusBarHeight: 0,
    windowHeight: 0,
    bodyPaddingTop: 0,
  });

  useEffect(() => {
    const updateDebugInfo = () => {
      const isNative = Capacitor.isNativePlatform();
      const bodyStyle = getComputedStyle(document.body);
      const htmlStyle = getComputedStyle(document.documentElement);

      setDebugInfo({
        isNative,
        statusBarHeight:
          parseInt(htmlStyle.getPropertyValue("--sat") || "0") || 0,
        windowHeight: window.innerHeight,
        bodyPaddingTop: parseInt(bodyStyle.paddingTop) || 0,
      });

      if (isNative) {
        // Force status bar configuration
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setStyle({ style: Style.Default });
      }
    };

    updateDebugInfo();
    window.addEventListener("resize", updateDebugInfo);

    return () => window.removeEventListener("resize", updateDebugInfo);
  }, []);

  if (!debugInfo.isNative) {
    return null; // Hide in browser
  }

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] bg-red-500 text-white text-xs p-2 font-mono"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: "rgba(255, 0, 0, 0.9)",
        color: "white",
        fontSize: "10px",
        padding: "4px",
        fontFamily: "monospace",
      }}
    >
      <div>🔴 STATUS BAR DEBUG (Remove this component after testing)</div>
      <div>Native: {debugInfo.isNative ? "YES" : "NO"}</div>
      <div>Window H: {debugInfo.windowHeight}px</div>
      <div>Body Padding Top: {debugInfo.bodyPaddingTop}px</div>
      <div>
        Overlap Test:{" "}
        {debugInfo.bodyPaddingTop < 24 ? "⚠️ LIKELY OVERLAP" : "✅ PROBABLY OK"}
      </div>
    </div>
  );
};
