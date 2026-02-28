/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@scrutis/ui"],
  serverExternalPackages: ["@scrutis/db"],
}

export default nextConfig
