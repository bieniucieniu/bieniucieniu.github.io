import { inView } from "framer-motion/dom";
import { useEffect, useState } from "react";

export function useListenInView(id: string): boolean {
  const [state, setState] = useState<boolean>(false);
  useEffect(() => {
    console.log(document.getElementById(id));
    return inView(id, (_, e) => {
      setState(e.isIntersecting);
      return (e) => setState(e.isIntersecting);
    });
  }, [id]);
  return state;
}
