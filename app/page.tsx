import Section from "@/components/Section";
import Nav from "@/components/Nav";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const projects: { title: string; content: React.ReactNode; tags: string[] }[] =
  [
    {
      title: "Bracia Bien",
      content: `
          This is a web page for my father’s shop. It features fully dynamic
          images stored on a bucket and managed through a Postgres database on
          the admin page.

`,
      tags: ["Next.js 13", " Shadcn-UI ", " Framer Motion"],
    },
    {
      title: "Breakout",
      content: `This is a replica of the classic breakout game. It also has a
                ‘gravity’ version, but it performs poorly.`,
      tags: ["TypeScript", "three.js", "vanilla-extract-css"],
    },

    {
      title: "Portfolio",
      content: `This is my personal website, which features a ‘window manager’.
                An interesting aspect of this website
                is that the content in the window can be rendered on the Next.js
                server.`,
      tags: ["Next.js", "Framer Motion"],
    },
    {
      title: "Midar",
      content: "IT company website, currently in production.",
      tags: ["Next.js 13", " Shadcn-UI ", " Framer Motion"],
    },
    {
      title: "sorting",
      content: `This is my first real project with vanilla JS/TS, which utilizes
                HTML canvas to visualize four sorting algorithms.`,
      tags: ["vanilla js", "TypeScript"],
    },
    {
      title: "weather app",
      content: `This is my only project that uses Angular. It utilizes the Open
                Weather API to display the temperature, weather condition and
                wind speed.`,
      tags: ["Angular"],
    },
  ];

export default function Home() {
  return (
    <div className="max-w-screen-xl mx-auto relative flex lg:px-20">
      <header className="opacity-80 lg:sticky lg:top-0 lg:left-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
        <div>
          <h1 className="font-black text-5xl leading-normal drop-shadow">
            Mikołaj Bień
          </h1>
          <h3 className="text-xl font-normal text-slate-400 drop-shadow">
            juniot Front-end developer
          </h3>
          <div className="flex flex-row gap-x-4 py-2">
            <Link
              className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
              href="https://github.com/bieniucieniu"
              target="_blank"
            >
              <Github />
            </Link>
            <Link
              className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
              href="mailto:bienmikolaj@gmail.com"
              target="_blank"
            >
              <Mail />
            </Link>
            <Link
              className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
              href="https://www.linkedin.com/in/mikołaj-bień-6090b2237"
              target="_blank"
            >
              <Linkedin />
            </Link>
          </div>
          <Nav />
        </div>
      </header>
      <main className="w-1/2 flex flex-col gap-y-20 lg:py-24 ">
        <Section
          value="about"
          id="about"
          className="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
        >
          <p>
            I have three years of experience in web development, specializing in
            front-end technologies. I acquired my skills through self-study and
            freelance projects in Poland.
          </p>
          <p>
            I mainly use <span className="font-bold text-slate-100">React</span>{" "}
            and <span className="font-bold text-slate-100">TypeScript</span>{" "}
            with <span className="font-bold text-slate-100">Next.js</span> as my
            preferred tools for web development. I also employ various libraries
            and add-ons, such as{" "}
            <span className="font-bold text-slate-100">
              React-Free-Fiber/drei, Radix-ui, framer-motion, tailwind,
              vanilla-extract-css, zod, drizzle{" "}
            </span>{" "}
            and others.
          </p>
        </Section>

        <Section value="projects" id="projects">
          <ul className="flex flex-col pl-10 group">
            {projects.map(({ title, content, tags }) => (
              <li className="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:bg-slate-300/10 hover:!opacity-100 group-hover:opacity-60 transition-all">
                <h2 className="font-bold text-lg drop-shadow pb-3 group-hover/item:text-teal-400  transition-colors">
                  <a className="underline-offset-4 hover:underline">{title}</a>
                </h2>
                <p className="text-sm text-slate-400 group-hover/item:text-slate-300">
                  {content}
                </p>
                <ul className="flex gap-x-2 pt-3">
                  {tags.map((tag) => (
                    <li className="rounded-full font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1">
                      {tag}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Section>
      </main>
    </div>
  );
}
