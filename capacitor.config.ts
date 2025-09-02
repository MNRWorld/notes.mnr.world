import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "notes.mnr.world",
  appName: "আমার নোট",
  webDir: "out",
  backgroundColor: "#ffffff",
  plugins: {
    StatusBar: {
      style: "DEFAULT",
    },
  },
  android: {
    allowMixedContent: true,
    // Handle Android navigation bar
    webContentsDebuggingEnabled: false,
    // Ensure proper window handling
    appendUserAgent: "CapacitorApp",
    fullscreen: true,
  },
  ios: {
    // Handle iOS safe areas
    webContentsDebuggingEnabled: false,
    // Ensure proper window handling
    appendUserAgent: "CapacitorApp",
  },
};

export default config;
