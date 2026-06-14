import { A, useLocation, useNavigate } from "@solidjs/router";
import { For, Show, createMemo } from "solid-js";
import {
	scrollToAnchor,
	scrollToAnchorWhenReady,
	scrollToHomeSection,
	scrollToHomeSectionWhenReady,
} from "~/lib/home-section";
import {
	isOnNavBranch,
	navTree,
	routeItems,
	type NavTreeItem,
} from "~/lib/nav-tree";
import { useScrollSpySection } from "~/lib/scroll-spy";

const linkClass =
	"text-slate-500 font-medium transition-colors hover:text-slate-200 data-[active=true]:text-teal-300";

function useIsActive(item: NavTreeItem) {
	const location = useLocation();
	const activeSection = useScrollSpySection();

	return createMemo(() => {
		if (item.href === "/") {
			return location.pathname === "/";
		}
		if (item.sectionId) {
			return location.pathname === "/" && activeSection() === item.sectionId;
		}
		if (item.anchorId && item.href) {
			return (
				location.pathname === item.href && location.hash === `#${item.anchorId}`
			);
		}
		if (item.branchHref) {
			return isOnNavBranch(location.pathname, item.branchHref);
		}
		if (!item.href) return false;
		return location.pathname === item.href;
	});
}

function TreeLink(props: { item: NavTreeItem; nested?: boolean }) {
	const location = useLocation();
	const navigate = useNavigate();
	const isActive = useIsActive(props.item);

	const href = createMemo(() => {
		if (props.item.sectionId) {
			return location.pathname === "/"
				? `#${props.item.sectionId}`
				: `/#${props.item.sectionId}`;
		}
		if (props.item.anchorId && props.item.href) {
			return location.pathname === props.item.href
				? `#${props.item.anchorId}`
				: `${props.item.href}#${props.item.anchorId}`;
		}
		return props.item.href ?? "#";
	});

	const handleClick = (event: MouseEvent) => {
		const anchor = props.item.sectionId ?? props.item.anchorId;
		if (!anchor) return;
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();

		if (props.item.sectionId) {
			if (location.pathname === "/") {
				scrollToHomeSection(props.item.sectionId);
				return;
			}

			navigate(`/#${props.item.sectionId}`, { scroll: false });
			scrollToHomeSectionWhenReady(props.item.sectionId);
			return;
		}

		if (props.item.anchorId && props.item.href) {
			if (location.pathname === props.item.href) {
				scrollToAnchor(props.item.anchorId);
				return;
			}

			navigate(`${props.item.href}#${props.item.anchorId}`, { scroll: false });
			scrollToAnchorWhenReady(props.item.anchorId);
		}
	};

	const label = () => (
		<span class={linkClass} data-active={isActive()}>
			{props.item.name}
		</span>
	);

	return (
		<li class="leading-relaxed py-0.5" classList={{ "pl-4": props.nested }}>
			<Show
				when={props.item.sectionId || props.item.anchorId}
				fallback={
					<A href={href()} class="text-sm">
						{label()}
					</A>
				}
			>
				<a href={href()} onClick={handleClick} class="text-sm">
					{label()}
				</a>
			</Show>
		</li>
	);
}

function NavBranch(props: { item: NavTreeItem }) {
	const location = useLocation();
	const isActive = useIsActive(props.item);
	const expanded = createMemo(() =>
		props.item.branchHref
			? isOnNavBranch(location.pathname, props.item.branchHref)
			: false,
	);

	const label = () => (
		<span class={linkClass} data-active={isActive()}>
			{props.item.name}
		</span>
	);

	return (
		<>
			<li class="leading-relaxed py-0.5">
				<A href={props.item.href ?? "/"} class="text-sm">
					{label()}
				</A>
			</li>
			<Show when={expanded() && props.item.children?.length}>
				<For each={props.item.children}>
					{(child) => <TreeLink item={child} nested />}
				</For>
			</Show>
		</>
	);
}

export default function FileTreeNav() {
	return (
		<nav aria-label="Site navigation" class="w-max min-w-[6.5rem]">
			<ul class="text-sm">
				<NavBranch item={navTree} />
				<For each={routeItems}>
					{(item) =>
						item.children?.length ? (
							<NavBranch item={item} />
						) : (
							<TreeLink item={item} />
						)
					}
				</For>
			</ul>
		</nav>
	);
}
