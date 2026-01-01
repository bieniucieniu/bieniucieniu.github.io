import { A } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import Nav from "~/components/navbar";
import { contacts, type Project, projects } from "~/lib/data";

export default function Home() {
	return (
		<div class="max-w-(--breakpoint-xl) relative flex flex-col lg:flex-row lg:px-20 mx-4 sm:mx-20 lg:mx-auto">
			<Header />
			<main class="lg:w-1/2 flex flex-col gap-y-20 lg:py-24 ">
				<section
					//value="about"
					id="about"
					class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
				>
					<About />
				</section>

				<section id="projects">
					<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
						Projects
					</h2>
					<ul class="flex flex-col pl-10 group">{projects.map(ProjectCard)}</ul>
				</section>
				<section id="contacts">
					<Footer />
				</section>
			</main>
		</div>
	);
}

function About() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				About
			</h2>
			<p>
				I have three years of experience in web development, specializing in
				front-end technologies. I acquired my skills through self-study and
				freelance projects in Poland.
			</p>
			<p>
				I mainly use <span class="font-bold text-slate-100">React</span> and{" "}
				<span class="font-bold text-slate-100">TypeScript</span> with{" "}
				<span class="font-bold text-slate-100">Next.js</span> as my preferred
				tools for web development. I also employ various libraries and add-ons,
				such as{" "}
				<span class="font-bold text-slate-100">
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
		<header class="opacity-80 lg:sticky lg:top-0 lg:left-0 lg:flex lg:max-h-screen lg:w-1/2 lg:flex-col lg:justify-between lg:py-24">
			<div>
				<h1 class="font-black text-3xl sm:text-5xl leading-normal drop-shadow-sm">
					Mikołaj Bień
				</h1>
				<h3 class="text-xl font-normal text-slate-400 drop-shadow-sm">
					Front-end developer
				</h3>
				<div class="flex flex-row gap-x-4 py-2">
					{contacts.map((c) => {
						return (
							<a
								class="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
								href={c.href}
								target="_blank"
							>
								{c.label}
							</a>
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
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				Contacts
			</h2>
			<ul class="pl-10 text-lg font-bold group">
				{contacts.map((c) => {
					return (
						<li class="opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all">
							<A class="flex flex-col" href={c.href} target="_blank">
								<span class="hover:underline">{c.label}</span>
								<span class="text-sm opacity-40">{c.hrefLabel}</span>
							</A>
						</li>
					);
				})}
			</ul>
		</footer>
	);
}

import { MoveUpRight } from "lucide-solid";
import github from "/public/github-mark-white.svg?url";

function ProjectCard(props: Project) {
	const link = createMemo(() => {
		const link = props.link;
		const inner = (
			<>
				<h2
					class="flex items-center gap-x-1 font-bold text-lg drop-shadow-sm transition-colors underline-offset-3"
					classList={{
						"group-hover/link:underline": !!props.link,
					}}
				>
					{props.title}
				</h2>
				<Show when={props.link}>
					<MoveUpRight class="h-3 w-3 opacity-70 group-hover/link:opacity-90 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
				</Show>
			</>
		);
		return link ? (
			<A
				href={link}
				target="_blank"
				class="group/link flex items-center gap-1 group-hover/item:text-teal-400"
			>
				{inner}
			</A>
		) : (
			<div class="group/link flex items-center gap-1 group-hover/item:text-teal-400">
				{inner}
			</div>
		);
	});
	return (
		<li class="p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:bg-slate-300/10 hover:opacity-100! group-hover:opacity-60 transition-all">
			<div class="flex items-center pb-3 justify-between">
				{link()}
				{props.status ? (
					<ul class="flex gap-x-2">
						{props.status.map((tag) => (
							<li
								class={twMerge(
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
			<p class="text-sm text-slate-400 group-hover/item:text-slate-300">
				{props.content}
			</p>
			<div class="flex justify-between pt-3">
				<ul class="flex gap-x-2">
					{props.tags.map((tag) => (
						<li class="rounded-full flex items-center font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1">
							{tag}
						</li>
					))}
				</ul>
				{props.repo !== undefined ? (
					<A
						href={props.repo}
						target="_blank"
						class="opacity-70 rounded-full group-hover:opacity-90 hover:backdrop-blur-md hover:bg-slate-500/10"
					>
						<img src={github} alt="github" class="h-5 w-5 m-1" />
					</A>
				) : null}
			</div>
		</li>
	);
}
