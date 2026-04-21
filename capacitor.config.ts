import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.globalattract.globalattractai',
  appName: 'global_attract',
  webDir: 'dist',
  plugins: {
    // Disable swipe-to-close on iOS, let the app handle back navigation
    App: {
      iosScheme: 'capacitor',
    },
  },
};

export default config;
