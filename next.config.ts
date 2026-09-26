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
    : {
        // "standalone" output is what the production Dockerfile (see
        // Dockerfile at the repo root) copies into the final image --
        // Next.js traces exactly the files/node_modules the server needs
        // and writes a minimal .next/standalone/server.js, so the ECS
        // Fargate image doesn't need `npm install` or the full repo at
        // runtime. Has no effect on `next dev` or the GitHub Pages static
        // export build above. See node_modules/next/dist/docs/01-app/03-
        // api-reference/05-config/01-next-config-js/output.md.
        output: "standalone" as const,
      }),
};

export default nextConfig;
