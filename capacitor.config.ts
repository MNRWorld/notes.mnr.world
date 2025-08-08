import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'notes.mnr.world',
  appName: 'mnr-notes',
  webDir: 'out', 
  bundledWebRuntime: false,
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#ffffffff',
    },
  },
};

export default config;
