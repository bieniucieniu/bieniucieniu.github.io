import { JSX } from "solid-js";

export type Project = {
  title: string;
  content: JSX.Element;
  tags: string[];
  status?: ("finished" | "suspended" | "in progress" | "not hosted")[];
  link?: string;
  repo?: string;
};
export const projects: Project[] = [
  {
    title: "ball",
    content: "zig + raylib balls physics simulation",
    status: ["in progress", "not hosted"],
    tags: ["zig", "raylib"],
    repo: "https://github.com/bieniucieniu/bracia-bien",
  },
  {
    title: "Bracia Bien",
    content: `
          This is a web page for my father’s shop. It features fully dynamic
          images stored on a bucket and managed through a Postgres database on
          the admin page.
`,
    tags: ["next.js 13", "shadcn", " framer motion"],
    status: ["in progress"],
    link: "https://braciabien.pl/",
    repo: "https://github.com/bieniucieniu/bracia-bien",
  },
  {
    title: "Breakout",
    content:
      "2D/3D game leveraging vanilla React and the react-three-fiber library for 3D rendering with  JSX templating and React. Implemented 2D physics with react and utilities from three-fibe and state management with zustand.",
    tags: ["three.js", "vanilla-extract-css"],
    status: ["finished"],
    link: "https://breakout.bieniucieniu.pl/",
    repo: "https://github.com/bieniucieniu/breakout",
  },

  {
    title: "previous Portfolio",
    content: `This used to be my personal website, which features a ‘window manager’.
                An interesting aspect of this website
                is that the content in the window can be rendered on the Next.js
                server.`,
    tags: ["next.js", "framer motion"],
    status: ["suspended"],
    link: "https://previous.bieniucieniu.pl",
    repo: "https://github.com/bieniucieniu/portfolio-website",
  },
  {
    title: "webisite template",
    content: "IT company website template.",
    tags: ["Next.js 13", "Shadcn-UI ", "Framer Motion"],
    status: ["suspended"],
    link: "https://midar.bieniucieniu.pl/",
    repo: "https://github.com/bieniucieniu/midar-astro",
  },
  {
    title: "sorting",
    content: `This is my first real project with vanilla JS/TS, which utilizes
                HTML canvas to visualize four sorting algorithms.`,
    tags: ["vanilla js"],
    status: ["finished"],
    link: "https://sorting.bieniucieniu.pl/",
    repo: "https://github.com/bieniucieniu/sorting",
  },
  {
    title: "weather app",
    content: `This is my only project that uses Angular. It utilizes the Open
                  Weather API to display the temperature, weather condition and
                  wind speed.`,
    tags: ["Angular"],
    status: ["suspended"],
    link: "https://weather-app.bieniucieniu.pl/",
    repo: "https://github.com/bieniucieniu/weather-app-angular",
  },
  {
    title: "no esta bien",
    content:
      "puzzle game based on notpron, writen in go, gofiber, and vanilla html and css. \n Currently only one level and basic auth on jwt.",
    tags: ["go", "go fiber", "html", "css"],
    status: ["suspended", "not hosted"],
    link: "https://github.com/bieniucieniu/noestabien",
    repo: "https://github.com/bieniucieniu/noestabien",
  },
];
export type Contact = { label: string; href: string; hrefLabel: string };
export const contacts: Contact[] = [
  {
    label: "github",
    href: "https://github.com/bieniucieniu",
    hrefLabel: "github.com/bieniucieniu",
  },
  {
    label: "bienmikolaj@gmail.com",
    href: "mailto:bienmikolaj@gmail.com",
    hrefLabel: "bienmikolaj@gmail.com",
  },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/mikołaj-bień-6090b2237",
    hrefLabel: "www.linkedin.com/in/mikołaj-bień-6090b2237",
  },
];
