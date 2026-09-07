import type { CapacitorConfig } from '@capacitor/cli';

// RecetApp empaqueta el sitio de producción (Vercel) dentro de un WebView
// nativo. Antes de `npx cap add android|ios` completá NEXT_PUBLIC_SITE_URL
// con la URL real desplegada y corré `npm run cap:sync`.
const config: CapacitorConfig = {
  appId: 'com.recetapp.app',
  appName: 'RecetApp',
  webDir: 'public',
  server: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://recetapp.vercel.app',
    androidScheme: 'https',
    cleartext: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 800,
      backgroundColor: '#FBF7F1',
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
  },
};

export default config;
