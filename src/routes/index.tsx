import { A } from "@solidjs/router";
import { createMemo, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import Layout, { Footer } from "~/components/layout";
import { type Project, projects, skillCategories } from "~/lib/data";

export default function Home() {
	return (
		<Layout>
			<section
				id="about"
				class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
			>
				<About />
			</section>

			<section
				id="skills"
				class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
			>
				<Skills />
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
		</Layout>
	);
}

function About() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				About
			</h2>
			<p>
				Results-driven Web Developer with over 3 years of experience
				specializing in scalable{" "}
				<span class="font-bold text-slate-100">React</span> and{" "}
				<span class="font-bold text-slate-100">TypeScript</span> applications.
				Expert in the{" "}
				<span class="font-bold text-slate-100">TanStack ecosystem</span> (Query,
				Form, Table, Router) for efficient data management and UI/UX
				optimization.
			</p>
			<p>
				Advanced DevOps expertise in building{" "}
				<span class="font-bold text-slate-100">GitLab CI/CD</span> pipelines and
				managing{" "}
				<span class="font-bold text-slate-100">Kubernetes</span> clusters via
				GitOps (<span class="font-bold text-slate-100">FluxCD</span>), delivering
				end-to-end solutions for complex transport and internal logistics tools.
				Experienced in cross-platform development with{" "}
				<span class="font-bold text-slate-100">React Native</span> and{" "}
				<span class="font-bold text-slate-100">Jetpack Compose</span>.
			</p>
		</>
	);
}

function Skills() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				Skills
			</h2>
			<ul class="flex flex-col gap-y-4 pl-10">
				{skillCategories.map((cat) => (
					<li class="flex flex-col gap-y-2">
						<h3 class="font-bold text-slate-100 text-sm">{cat.category}</h3>
						<ul class="flex flex-wrap gap-2">
							{cat.skills.map((skill) => (
								<li class="rounded-full font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1">
									{skill}
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</>
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
										"in production":
											"bg-teal-500/10 group-hover/item:bg-teal-500/50",
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
