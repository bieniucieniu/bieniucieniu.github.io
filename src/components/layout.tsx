import { A } from "@solidjs/router";
import { For, type JSX } from "solid-js";
import { motion } from "@/components/motion";
import { activeLink, TextLink } from "@/components/text-link";
import { Separator } from "@/components/ui/separator";
import { contacts } from "@/lib/data";

const nav = [
	{ href: "/", label: "about" },
	{ href: "/projects", label: "projects" },
	{ href: "/experience", label: "experience" },
	{ href: "/libs", label: "libs" },
];

export default function Layout(props: { children?: JSX.Element }) {
	return (
		<div class="mx-auto flex min-h-screen max-w-3xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-16">
			<header class="flex flex-col gap-4">
				<div>
					<h1 class="text-3xl font-black sm:text-4xl">
						<A href="/">Mikołaj Bień</A>
					</h1>
					<p class="text-muted-foreground">Web developer</p>
				</div>
				<nav aria-label="Main" class="flex flex-wrap gap-x-5 gap-y-1 text-sm">
					<For each={nav}>
						{(item) => (
							<TextLink
								variant="quiet"
								href={item.href}
								end
								activeClass={activeLink}
							>
								{item.label}
							</TextLink>
						)}
					</For>
				</nav>
			</header>

			<main class="flex-1">{props.children}</main>

			<footer id="contacts" class="flex flex-col gap-4 text-sm">
				<Separator />
				<ul class="flex flex-wrap gap-x-5 gap-y-1">
					<For each={contacts}>
						{(c) => (
							<li>
								<TextLink variant="quiet" href={c.href}>
									{c.label}
								</TextLink>
							</li>
						)}
					</For>
				</ul>
			</footer>
		</div>
	);
}

/** Page body with a short fade-in on mount. */
export function Page(props: { children: JSX.Element }) {
	return (
		<motion.div
			class="flex flex-col gap-12"
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.25 }}
		>
			{props.children}
		</motion.div>
	);
}

export function Section(props: {
	title: string;
	id?: string;
	children: JSX.Element;
}) {
	return (
		<section id={props.id} class="flex flex-col gap-4">
			<h2 class="text-sm font-bold tracking-wide text-primary uppercase">
				{props.title}
			</h2>
			{props.children}
		</section>
	);
}
