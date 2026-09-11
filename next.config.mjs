/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['firebase-admin', 'jwks-rsa'],
  experimental: {
    serverComponentsExternalPackages: ['firebase-admin', 'jwks-rsa'],
  },
};

export default nextConfig;
