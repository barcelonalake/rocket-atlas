const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const isProjectPages =
  process.env.GITHUB_ACTIONS === 'true' &&
  repositoryName !== '' &&
  !repositoryName.endsWith('.github.io');
const basePath = isProjectPages ? `/${repositoryName}` : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // The atlas has no server-side data or API routes. Exporting static files
  // keeps the production image small and avoids exposing a Next.js runtime.
  output: 'export',
  // GitHub project Pages is hosted below /<repository>. Custom-domain and
  // local builds keep using the domain root.
  basePath,
  assetPrefix: basePath,
  // Imperative three.js objects are built once and mutated by refs; React
  // Strict Mode's double-invoke would build every vehicle twice. Off by choice.
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['three'],
};
export default nextConfig;
