/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  experimental: {
    allowedDevOrigins: [
      "https://6000-firebase-mnr-notes-1755860136385.cluster-cd3bsnf6r5bemwki2bxljme5as.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
