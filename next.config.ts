import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Os prompts e o corpus jurídico são lidos do disco pelos route handlers
  // (src/lib/ia/prompts.ts e src/lib/ia/rag.ts). Garante que sejam incluídos
  // no bundle serverless da Vercel.
  outputFileTracingIncludes: {
    "/api/**": ["./prompts/**", "./knowledge/**"],
  },
};

export default nextConfig;
