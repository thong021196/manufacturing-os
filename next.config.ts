import type { NextConfig } from "next";

const isGithubPagesPreview = process.env.GITHUB_PAGES === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "manufacturing-os";
const previewPath = `/${repositoryName}/frontend-preview`;

const nextConfig: NextConfig = {
  ...(isGithubPagesPreview
    ? {
        output: "export" as const,
        trailingSlash: true,
        basePath: previewPath,
        assetPrefix: `${previewPath}/`,
      }
    : {}),
};

export default nextConfig;
