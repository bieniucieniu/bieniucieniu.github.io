import { type Component, For, onMount } from "solid-js";
import { Page, Section } from "@/components/layout";
import MotionDemo from "@/demos/motion";
import TiptapDemo from "@/demos/tiptap";
import XyflowDemo from "@/demos/xyflow";

type Lib = {
	slug: string;
	title: string;
	description: string;
	Demo: Component;
};

const repo = "https://github.com/bieniucieniu/solid-kit";

const libs: Lib[] = [
	{
		slug: "tiptap",
		title: "@solid-kit/tiptap",
		description: "Tiptap editor bindings that follow the @tiptap/react API.",
		Demo: TiptapDemo,
	},
	{
		slug: "xyflow",
		title: "@solid-kit/xyflow",
		description:
			"Node-based graph editor on @xyflow/system, with the graph held in a Solid store.",
		Demo: XyflowDemo,
	},
	{
		slug: "motion",
		title: "@solid-kit/motion",
		description:
			"Solid lifecycle around the vanilla motion API, with props that match Motion for React.",
		Demo: MotionDemo,
	},
];

export default function LibsPage() {
	// The page is lazy-loaded, so the browser's own hash scroll runs before
	// the sections exist. Scroll once they are mounted.
	onMount(() => {
		const id = decodeURIComponent(location.hash.slice(1));
		if (!libs.some((lib) => lib.slug === id)) return;
		setTimeout(() =>
			document.getElementById(id)?.scrollIntoView({ behavior: "instant" }),
		);
	});

	return (
		<Page>
			<Section title="Libs">
				<p class="text-sm leading-relaxed text-muted-foreground">
					Live demos from{" "}
					<a
						href={repo}
						target="_blank"
						rel="noreferrer"
						class="text-primary underline underline-offset-4"
					>
						solid-kit
					</a>
					, my SolidJS ports of React libraries. Work in progress. The UI on
					this site comes from its shadcn registry.
				</p>
			</Section>
			<For each={libs}>
				{(lib) => (
					<section id={lib.slug} class="flex scroll-mt-8 flex-col gap-3">
						<div>
							<h3 class="font-bold">
								<a
									href={`${repo}/tree/main/packages/${lib.slug}`}
									target="_blank"
									rel="noreferrer"
									class="hover:underline"
								>
									{lib.title}
								</a>
							</h3>
							<p class="text-sm text-muted-foreground">{lib.description}</p>
						</div>
						<lib.Demo />
					</section>
				)}
			</For>
		</Page>
	);
}
