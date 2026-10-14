/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["nodemailer", "xlsx"]
};

export default nextConfig;
