import Section from "@/components/Section";
import Nav from "@/components/Nav";
import { Github, Linkedin, Mail } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-screen-xl mx-auto relative flex lg:px-20">
      <header className="lg:sticky lg:top-0 lg:left-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24 ">
        <div>
          <h1 className="font-black text-5xl leading-normal">Mikołaj Bień</h1>
          <h3 className="text-xl font-normal">juniot Front-end developer</h3>
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
      <main className="w-1/2 flex flex-col lg:py-24 ">
        <Section
          value="about"
          id="about"
          amount="all"
          className="flex gap-y-3 flex-col text-lg leading-relaxed text-slate-300 font-normal"
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

        <Section
          value="projects"
          id="projects"
          amount="some"
          className="gap-96 flex flex-col lg:py-24"
        >
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </Section>
      </main>
    </div>
  );
}
