import { A, useLocation } from "@solidjs/router";
import { createMemo } from "solid-js";

const linkClass =
	"group flex flex-row items-center py-2 data-[active=true]:[&_span:first-child]:bg-slate-100 data-[active=true]:[&_span:first-child]:w-14";

export default function RouteLink(props: { href: string; text: string }) {
	const location = useLocation();

	const isActive = createMemo(() => location.pathname === props.href);

	return (
		<li>
			<A href={props.href} class={linkClass} data-active={isActive()}>
				<span class="inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-hover:bg-slate-400 group-hover:w-14" />
				<span class="text-slate-500 font-black transition-all text-md group-hover:text-slate-300 uppercase">
					{props.text}
				</span>
			</A>
		</li>
	);
}
