import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "notes.mnr.world",
  appName: "আমার নোট",
  webDir: "out",
  bundledWebRuntime: false,
  backgroundColor: "#ffffff",
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    },
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
