import { type ElementOrSelector, inView } from "framer-motion/dom";
import { useEffect } from "react";
import { useCreateSharedState, useSharedState } from "./signal/";

export function useListenInView(id: ElementOrSelector): boolean {
  const p = useCreateSharedState(false);
  useEffect(() => {
    return inView(id, (_, e) => {
      p.update(e.isIntersecting);
      return (e) => p.update(e.isIntersecting);
    });
  }, [id, p]);
  return useSharedState(p);
}
