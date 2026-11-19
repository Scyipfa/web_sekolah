/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['exceljs'],
  experimental: { serverActions: { bodySizeLimit: '3mb' } },
};
export default nextConfig;
