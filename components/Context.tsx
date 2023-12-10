"use client";

import { SetStateAction, createContext, useContext, useState } from "react";

export type values = "about" | "projects" | "contacts";
type Context = {
  focus: values;
  setFocus: React.Dispatch<SetStateAction<values>>;
};

const context = createContext<Context | undefined>(undefined);

export function MainContextProvider(props: {
  defaultValue: "about" | "projects";
  children: React.ReactNode;
}) {
  const [focus, setFocus] = useState<values>("about");
  return (
    <context.Provider {...props} value={{ focus, setFocus }}></context.Provider>
  );
}

export function useMainContext() {
  const c = useContext(context);
  if (!c) throw new Error("not in main context");

  return c;
}
