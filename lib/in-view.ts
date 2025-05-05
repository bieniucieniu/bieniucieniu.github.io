import { inView } from "framer-motion/dom";
import { useEffect } from "react";
import { updatePocketState, useCreatePocket, usePocketState } from "./pocket";

export function useListenInView(id: string): boolean {
  // const [state, setState] = useState<boolean>(false);
  const p = useCreatePocket(false);
  useEffect(() => {
    return inView(id, (_, e) => {
      updatePocketState(p, e.isIntersecting);
      return (e) => updatePocketState(p, e.isIntersecting);
    });
  }, [id, p]);
  return usePocketState(p);
}
