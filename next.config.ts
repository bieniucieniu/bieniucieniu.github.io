import type { NextConfig } from "next";

export default {
  output: "export",
  experimental: {
    reactCompiler: true,
  },
} satisfies NextConfig;
