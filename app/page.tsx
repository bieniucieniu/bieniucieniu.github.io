import type { Url } from "url";
import Nav from "@/components/Nav";
import { Github } from "@/components/ui/icons/github";
import { MoveUpRight } from "lucide-react";
import NextLink from "next/link";
import { createElement } from "react";
import { twMerge } from "tailwind-merge";
function Link(
	props: React.HTMLProps<HTMLAnchorElement> & { href?: string | Url },
) {
	return createElement(props.href ? NextLink : "a", props as any);
}

type Project = {
	title: string;
	content: React.ReactNode;
	tags: string[];
	status?: ("finished" | "suspended" | "in progress" | "not hosted")[];
	link?: string;
	repo?: string;
};
const projects: Project[] = [
	{
		title: "Bracia Bien",
		content: `
          This is a web page for my father’s shop. It features fully dynamic
          images stored on a bucket and managed through a Postgres database on
          the admin page.
`,
		tags: ["Next.js 13", " Shadcn-UI ", " Framer Motion"],
		status: ["in progress"],
		link: "https://braciabien.pl/",
		repo: "https://github.com/bieniucieniu/bracia-bien",
	},
	{
		title: "Breakout",
		content: `2D/3D game leveraging vanilla React and the react-three-fiber library for 3D rendering with  JSX templating and React. Implemented 2D physics with react and utilities from three-fibe and state management with zustand.`,
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
		tags: ["Next.js", "Framer Motion"],
		status: ["suspended"],
		link: "https://previous.bieniucieniu.pl",
		repo: "https://github.com/bieniucieniu/portfolio-website",
	},
	{
		title: "Midar",
		content: "IT company website, currently in production.",
		tags: ["Next.js 13", " Shadcn-UI ", " Framer Motion"],
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
		content: `puzzle game based on notpron, writen in go, gofiber, and vanilla html and css. \n Currently only one level and basic auth on jwt.`,
		tags: ["Go", "Go Fiber", "html", "css"],
		status: ["suspended", "not hosted"],
		link: "https://github.com/bieniucieniu/noestabien",
		repo: "https://github.com/bieniucieniu/noestabien",
	},
];

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
					<section>
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
					<Link
						className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
						href="mailto:bienmikolaj@gmail.com"
						target="_blank"
					>
						bienmikolaj@gmail.com
					</Link>
					<Link
						className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
						href="https://github.com/bieniucieniu"
						target="_blank"
					>
						github
					</Link>
					<Link
						className="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
						href="https://www.linkedin.com/in/mikołaj-bień-6090b2237"
						target="_blank"
					>
						linkedin
					</Link>
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
				<li className="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all">
					<span className="">github: </span>
					<Link
						className="text-teal-500 hover:underline"
						href="https://github.com/bieniucieniu"
						target="_blank"
					>
						github.com/bieniucieniu
					</Link>
				</li>
				<li className="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all">
					mail:{" "}
					<Link
						className="text-teal-500 hover:underline"
						href="mailto:bienmikolaj@gmail.com"
						target="_blank"
					>
						bienmikolaj@gmail.com
					</Link>
				</li>
				<li className="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all">
					linkedin:{" "}
					<Link
						className="text-teal-500 hover:underline"
						href="https://www.linkedin.com/in/mikołaj-bień-6090b2237"
						target="_blank"
					>
						www.linkedin.com/in/mikołaj-bień-6090b2237
					</Link>
				</li>
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
						{props.status.map((tag, i) => (
							<li
								key={props.title + tag + i}
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
					{props.tags.map((tag, i) => (
						<li
							key={props.title + tag + i}
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
