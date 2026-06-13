import { A } from "@solidjs/router";
import { MoveUpRight } from "lucide-solid";
import { createMemo, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Project } from "~/lib/data";
import github from "/public/github-mark-white.svg?url";

export default function ProjectCard(props: Project) {
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
