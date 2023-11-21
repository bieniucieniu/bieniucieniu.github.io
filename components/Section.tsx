"use client";
import { Slot } from "@radix-ui/react-slot";
import { useMainContext, values } from "./Context";
import { useEffect, useRef } from "react";
import { useInView } from "framer-motion";

export default function Section({
  children,
  value,
  asChild,
  amount,
  ...props
}: {
  value: values;
  asChild?: boolean;
  amount?: "all" | "some" | number;
} & React.HTMLAttributes<HTMLElement>) {
  const { setFocus } = useMainContext();
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, {
    once: false,
    amount: amount || 0.5,
  });

  const Comp = asChild ? Slot : "section";

  useEffect(() => {
    if (isInView == true) setFocus(value);
  }, [isInView]);

  return (
    <Comp {...props} ref={ref}>
      {children}
    </Comp>
  );
}
