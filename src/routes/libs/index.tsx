import { A } from "@solidjs/router";
import { type Component, ErrorBoundary, onMount } from "solid-js";
import Layout from "~/components/layout";
import NavPageHeader from "~/components/nav-page-header";
import { scrollToAnchorWhenReady } from "~/lib/home-section";
import { type Lib, libs } from "~/lib/libs-catalog";
import { getNavChildren, libTitle, type NavTreeItem } from "~/lib/nav-tree";
import TiptapDemo from "~/libs/tiptap/demo";
import github from "/public/github-mark-white.svg?url";

const libDemos: Record<string, Component> = {
	tiptap: TiptapDemo,
};

export default function LibsPage() {
	const items = getNavChildren("/libs");

	onMount(() => {
		const slug = location.hash.replace("#", "");
		if (slug && libs.some((lib) => lib.slug === slug)) {
			scrollToAnchorWhenReady(slug);
		}
	});

	return (
		<Layout>
			<section class="flex flex-col gap-y-4 leading-relaxed text-slate-300 font-normal opacity-80">
				<NavPageHeader />
				<ErrorBoundary fallback={<p>Error loading libs</p>}>
					<ul class="flex flex-col pl-10 group gap-y-6">
						{items.map((item) => (
							<LibEntry
								item={item}
								lib={libs.find((lib) => lib.slug === item.name)!}
							/>
						))}
					</ul>
				</ErrorBoundary>
			</section>
		</Layout>
	);
}

function LibEntry(props: { item: NavTreeItem; lib: Lib }) {
	const Demo = libDemos[props.lib.slug];

	if (!Demo) throw new Error(`No demo for ${props.lib.slug}`);

	return (
		<li
			id={props.lib.slug}
			class="scroll-mt-24 p-3 rounded-lg drop-shadow-xl backdrop-blur-md opacity-80 group/item hover:bg-slate-300/10 hover:opacity-100! group-hover:opacity-60 transition-all"
		>
			<div class="flex items-center pb-3">
				<a
					href={`#${props.lib.slug}`}
					class="group/link flex items-center gap-1 group-hover/item:text-teal-400"
				>
					<h3 class="flex items-center gap-x-1 font-bold text-lg drop-shadow-sm transition-colors underline-offset-3 group-hover/link:underline">
						{libTitle(props.item)}
					</h3>
				</a>
			</div>
			<p class="text-sm text-slate-400 group-hover/item:text-slate-300">
				{props.item.description}
			</p>
			<div class="flex justify-between pt-3">
				<ul class="flex gap-x-2">
					{props.item.tags?.map((tag) => (
						<li class="rounded-full flex items-center font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1">
							{tag}
						</li>
					))}
				</ul>
				<A
					href={props.item.repo!}
					target="_blank"
					class="opacity-70 rounded-full group-hover:opacity-90 hover:backdrop-blur-md hover:bg-slate-500/10"
				>
					<img src={github} alt="github" class="h-5 w-5 m-1" />
				</A>
			</div>
			<Demo />
		</li>
	);
}
