import { A, type AnchorProps } from "@solidjs/router";
import { Show, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

/**
 * Black and white only, so state is shown with underlines, not colour:
 * - inline: links inside text, always underlined
 * - quiet: nav and list links, dotted underline on hover; give the active
 *   route `activeClass={activeLink}` for a solid one
 */
const variants = {
	inline: "underline underline-offset-4 hover:decoration-2",
	quiet: "underline-offset-4 decoration-dotted hover:underline",
};

/** Solid underline for the current route on a `quiet` link. */
export const activeLink = "underline decoration-solid";

export type TextLinkProps = AnchorProps & {
	variant?: keyof typeof variants;
};

/**
 * Link that routes internal paths through the router and opens http(s) links
 * in a new tab.
 */
export function TextLink(props: TextLinkProps) {
	const [local, rest] = splitProps(props, ["variant", "class"]);
	const className = () => cn(variants[local.variant ?? "inline"], local.class);
	const isExternal = () => /^(https?:|mailto:)/.test(props.href);
	const newTab = () => props.href.startsWith("http");

	return (
		<Show when={isExternal()} fallback={<A {...rest} class={className()} />}>
			<a
				href={props.href}
				target={newTab() ? "_blank" : undefined}
				rel={newTab() ? "noreferrer" : undefined}
				class={className()}
			>
				{props.children}
			</a>
		</Show>
	);
}
