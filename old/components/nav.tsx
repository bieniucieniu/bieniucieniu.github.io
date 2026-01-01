"use client";
import { twMerge } from "tailwind-merge";
import { LinkCard } from "./ui/client";
import type { Link } from "./ui/link-card";

const links: Link[] = [
  {
    id: "about",
    text: "about",
  },
  {
    id: "projects",
    text: "projects",
  },
  {
    id: "contacts",
    text: "contacts",
  },
];
export default function Nav({ className }: { className?: string }) {
  return (
    <nav className={twMerge(className)}>
      <ul className="w-max">
        {links.map((props) => (
          <LinkCard key={props.id} id={props.id} text={props.text} />
        ))}
      </ul>
    </nav>
  );
}
