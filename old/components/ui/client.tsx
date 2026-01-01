"use client";
import dynamic from "next/dynamic";

export const Spotlight = dynamic(() => import("@/components/ui/spotlight"), {
  ssr: false,
});
export const LinkCard = dynamic(() => import("@/components/ui/link-card"), {
  ssr: false,
});
