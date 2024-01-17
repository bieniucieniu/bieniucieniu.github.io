"use client";
import { twMerge } from "tailwind-merge";
import { useMainContext } from "./Context";

export default function Nav({ className }: { className?: string }) {
  // const { focus } = useMainContext();
  return (
    <nav className={twMerge(className)}>
      <ul className="w-max">
        <li>
          <a href="#about" className="group flex flex-row items-center py-2">
            <span
              className={twMerge(
                "inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14",
                //               focus === "about" ? "bg-slate-100  w-14" : "",
              )}
            ></span>
            <span
              className={twMerge(
                "text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100",
                //               focus === "about" ? "text-slate-100 " : "",
              )}
            >
              ABOUT
            </span>
          </a>
        </li>
        <li>
          <a href="#projects" className="group flex flex-row items-center py-2">
            <span
              className={twMerge(
                "inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14",
                //              focus === "projects" ? "bg-slate-100  w-14" : "",
              )}
            ></span>
            <span
              className={twMerge(
                "text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100",
                //               focus === "projects" ? "text-slate-100 " : "",
              )}
            >
              PROJECTS
            </span>
          </a>
        </li>
        <li>
          <a href="#contacts" className="group flex flex-row items-center py-2">
            <span
              className={twMerge(
                "inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14",
                //               focus === "contacts" ? "bg-slate-100  w-14" : "",
              )}
            ></span>
            <span
              className={twMerge(
                "text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100",
                //               focus === "contacts" ? "text-slate-100 " : "",
              )}
            >
              CONTACTS
            </span>
          </a>
        </li>
      </ul>
    </nav>
  );
}
