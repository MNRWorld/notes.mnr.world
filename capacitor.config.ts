

import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'notes.mnr.world',
  appName: 'আমার নোট',
  webDir: 'out', 
  bundledWebRuntime: false,
  backgroundColor: '#ffffff',
  plugins: {
    StatusBar: {
    },
  },
};

export default config;
