import { useState } from "react";
import { Provider } from "./store";

export function StoreProvider() {
  const s = useState(() => new Map())[0];
  return <Provider value={s} />;
}
