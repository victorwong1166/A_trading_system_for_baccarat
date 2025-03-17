import withPWA from 'next-pwa';

let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['@neondatabase/serverless', 'postgres'],
  },
  // 禁用特定頁面的預渲染
  unstable_runtimeJS: true,
  unstable_JsPreload: false,
};

export default nextConfig;

