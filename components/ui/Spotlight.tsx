"use client";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export default function Spotlight({ className }: { className?: string }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const left = useMotionValue(0);
  const top = useMotionValue(0);

  function refCallback(e: HTMLDivElement | null) {
    if (!e) return;
    const { left: l, top: t } = e.getBoundingClientRect();
    left.set(l);
    top.set(t);
  }

  function handleMouseMove({ clientX, clientY }: MouseEvent) {
    mouseX.set(clientX - left.get());
    mouseY.set(clientY - top.get());
  }

  useEffect(() => {
    if (window.innerWidth < 1000) return;
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div
      ref={refCallback}
      className={twMerge("group overflow-hidden", className)}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px transition"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(45, 77, 166, 0.15),
              transparent 100%
            )
          `,
        }}
      />
    </div>
  );
}
