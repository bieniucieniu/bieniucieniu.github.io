import { A } from "@solidjs/router";
import type { JSX } from "solid-js";
import FileTreeNav from "~/components/file-tree-nav";
import { ScrollSpyProvider } from "~/lib/scroll-spy";
import { contacts } from "~/lib/data";

export default function Layout(props: { children: JSX.Element }) {
	return (
		<ScrollSpyProvider>
			<div class="max-w-(--breakpoint-xl) relative flex flex-col lg:flex-row lg:px-20 mx-4 sm:mx-20 lg:mx-auto">
				<Header />
				<main class="lg:flex-[0_0_50%] lg:min-w-0 flex flex-col gap-y-20 lg:py-24">
					{props.children}
				</main>
			</div>
		</ScrollSpyProvider>
	);
}

function Header() {
	return (
		<header class="opacity-80 lg:sticky lg:top-0 lg:left-0 lg:flex lg:max-h-screen lg:flex-[0_0_50%] lg:min-w-0 lg:flex-col lg:justify-between lg:py-24">
			<div>
				<h1 class="font-black text-3xl sm:text-5xl leading-normal drop-shadow-sm">
					<A href="/">Mikołaj Bień</A>
				</h1>
				<h3 class="text-xl font-normal text-slate-400 drop-shadow-sm">
					Web Developer
				</h3>
				<div class="flex flex-row flex-wrap gap-x-4 py-2">
					{contacts.map((c) => {
						const external = c.href.startsWith("http");
						return (
							<a
								class="border-b border-transparent text-slate-500 hover:text-slate-100 hover:border-slate-100/70 transition-colors ease-out"
								href={c.href}
								target={external ? "_blank" : undefined}
							>
								{c.label}
							</a>
						);
					})}
				</div>
				<div class="pt-4">
					<FileTreeNav />
				</div>
			</div>
		</header>
	);
}

export function Footer() {
	return (
		<footer>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				Contacts
			</h2>
			<ul class="pl-10 text-lg font-bold group">
				{contacts.map((c) => {
					const external = c.href.startsWith("http");
					return (
						<li class="opacity-80 group/item hover:opacity-100! group-hover:opacity-50 transition-all">
							<A
								class="flex flex-col"
								href={c.href}
								target={external ? "_blank" : undefined}
							>
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
