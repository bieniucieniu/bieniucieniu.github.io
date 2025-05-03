"use client";
import { twMerge } from "tailwind-merge";

type Link = { href: `${"#" | "https://"}${string}`; text: string };
const links: Link[] = [
  {
    href: "#about",
    text: "ABOUT",
  },
  {
    href: "#projects",
    text: "PROJECTS",
  },
  {
    href: "#contacts",
    text: "CONTACTS",
  },
];
export default function Nav({ className }: { className?: string }) {
  return (
    <nav className={twMerge(className)}>
      <ul className="w-max">{links.map(LinkCard)}</ul>
    </nav>
  );
}

function LinkCard(props: Link) {
  return (
    <li key={props.href}>
      <a href={props.href} className="group flex flex-row items-center py-2">
        <span
          className={
            "inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-active:bg-slate-100  group-active:w-14 group-hover:bg-slate-400 group-hover:w-14"
          }
        />
        <span
          className={
            "text-slate-500 font-black transition-all text-md group-hover:text-slate-300 group-active:text-slate-100"
          }
        >
          {props.text}
        </span>
      </a>
    </li>
  );
}
