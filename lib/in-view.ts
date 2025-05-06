import { type ElementOrSelector, inView } from "framer-motion/dom";
import { useEffect } from "react";
import { useCreatePocket, usePocketState } from "./pocket";

export function useListenInView(id: ElementOrSelector): boolean {
  const p = useCreatePocket(false);
  useEffect(() => {
    return inView(id, (_, e) => {
      p.update(e.isIntersecting);
      return (e) => p.update(e.isIntersecting);
    });
  }, [id, p]);
  return usePocketState(p);
}
