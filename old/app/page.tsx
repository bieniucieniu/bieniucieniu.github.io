import type { Url } from "node:url";
import Nav from "@/components/nav";
import { Github } from "@/components/ui/icons/github";
import { MoveUpRight } from "lucide-react";
import NextLink from "next/link";

import { type Project, contacts, projects } from "@/lib/data";
import { createElement } from "react";
import { twMerge } from "tailwind-merge";

function Link(
  props: React.HTMLProps<HTMLAnchorElement> & { href?: string | Url },
) {
  return createElement(props.href ? NextLink : "a", props as any);
}

export default function Home() {
  return (
    <>
      <div className="max-w-(--breakpoint-xl) relative flex flex-col lg:flex-row lg:px-20 mx-4 sm:mx-20 lg:mx-auto">
        <Header />
        <main className="lg:w-1/2 flex flex-col gap-y-20 lg:py-24 ">
          <section
            //value="about"
            id="about"
            className="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
          >
            <About />
          </section>

          <section id="projects">
            <h2 className="text-xl font-black text-teal-500/80 inline lg:hidden">
              Projects
            </h2>
            <ul className="flex flex-col pl-10 group">
              {projects.map(ProjectCard)}
            </ul>
          </section>
          <section id="contacts">
            <Footer />
          </section>
        </main>
      </div>
    </>
  );
}

function About() {
  return (
    <>
      <h2 className="text-xl font-black text-teal-500/80 inline lg:hidden">
        About
      </h2>
      <p>
        I have three years of experience in web development, specializing in
        front-end technologies. I acquired my skills through self-study and
        freelance projects in Poland.
      </p>
      <p>
        I mainly use <span className="font-bold text-slate-100">React</span> and{" "}
        <span className="font-bold text-slate-100">TypeScript</span> with{" "}
        <span className="font-bold text-slate-100">Next.js</span> as my
        preferred tools for web development. I also employ various libraries and
        add-ons, such as{" "}
        <span className="font-bold text-slate-100">
          React-Free-Fiber/drei, Radix-ui, framer-motion, tailwind,
          vanilla-extract-css, zod, drizzle{" "}
        </span>{" "}
        and others.
      </p>
    </>
  );
}

function Header() {
  return (
    <header className="opacity-80 lg:sticky lg:top-0 lg:left-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
      <div>
        <h1 className="font-black text-3xl sm:text-5xl leading-normal drop-shadow-sm">
          Mikołaj Bień
        </h1>
        <h3 className="text-xl font-normal text-slate-400 drop-shadow-sm">
          Front-end developer
        </h3>
        <div className="flex flex-row gap-x-4 py-2">
          {contacts.map((c) => {
            return (
              <Link
                key={c.label}
                className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
                href={c.href}
                target="_blank"
              >
                {c.label}
              </Link>
            );
          })}
        </div>
        <Nav />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <h2 className="text-xl font-black text-teal-500/80 inline lg:hidden">
        Contacts
      </h2>
      <ul className="pl-10 text-lg font-bold group">
        {contacts.map((c) => {
          return (
            <li
              key={c.label}
              className="opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all"
            >
              <Link className="flex flex-col" href={c.href} target="_blank">
                <span className="hover:underline">{c.label}</span>
                <span className="text-sm opacity-40">{c.hrefLabel}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </footer>
  );
}

function ProjectCard(props: Project) {
  return (
    <li
      key={props.link}
      className="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:bg-slate-300/10 hover:opacity-100! group-hover:opacity-60 transition-all"
    >
      <div className="flex items-center pb-3 justify-between">
        <Link
          key={props.title}
          {...(props.link ? { target: "_blank", href: props.link } : null)}
          className="group/link flex items-center gap-1 group-hover/item:text-teal-400"
        >
          <h2 className="flex items-center gap-x-1 font-bold text-lg drop-shadow-sm  transition-colors group-hover/link:underline underline-offset-3">
            {props.title}
          </h2>
          <MoveUpRight className="h-3 w-3 opacity-70 group-hover/link:opacity-90 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
        </Link>
        {props.status ? (
          <ul className="flex gap-x-2">
            {props.status.map((tag) => (
              <li
                key={props.title + tag}
                className={twMerge(
                  "rounded-full flex items-center font-bold backdrop-blur-md text-xs px-2 py-1 transition-colors",
                  {
                    finished: "bg-lime-300/10 group-hover/item:bg-lime-300/50",
                    suspended:
                      "bg-orange-600/10 group-hover/item:bg-orange-600/50",
                    "in progress":
                      "bg-sky-600/10 group-hover/item:bg-sky-600/50",
                    "not hosted":
                      "bg-slate-300/10 group-hover/item:bg-slate-300/50",
                  }[tag],
                )}
              >
                {tag}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <p className="text-sm text-slate-400 group-hover/item:text-slate-300">
        {props.content}
      </p>
      <div className="flex justify-between pt-3">
        <ul className="flex gap-x-2">
          {props.tags.map((tag) => (
            <li
              key={props.title + tag}
              className="rounded-full flex items-center font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1"
            >
              {tag}
            </li>
          ))}
        </ul>
        {props.repo !== undefined ? (
          <Link
            href={props.repo}
            target="_blank"
            className="opacity-70 rounded-full group-hover:opacity-90 hover:backdrop-blur-md hover:bg-slate-500/10"
          >
            <Github className="h-5 w-5 m-1" />
          </Link>
        ) : null}
      </div>
    </li>
  );
}
