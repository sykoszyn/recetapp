/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  // Capacitor empaqueta el build de Next contra un backend remoto (Vercel),
  // así que no se usa `output: 'export'` — la app nativa carga la URL de producción.
};

export default nextConfig;
