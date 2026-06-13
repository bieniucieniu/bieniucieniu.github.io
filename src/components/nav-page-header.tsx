import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";
import { findNavItemByPath, libTitle, type NavTreeItem } from "~/lib/nav-tree";

export default function NavPageHeader() {
	const location = useLocation();
	const item = () => findNavItemByPath(location.pathname);

	return (
		<Show when={item()} keyed>
			{(node) => <HeaderContent item={node} />}
		</Show>
	);
}

function HeaderContent(props: { item: NavTreeItem }) {
	const title = () => libTitle(props.item);

	return (
		<div>
			<h2 class="text-xl font-black text-teal-500/80 capitalize">{title()}</h2>
			<Show when={props.item.description}>
				<p class="text-sm text-slate-400 pt-2">
					{props.item.description}
					<Show when={props.item.repo}>
						{" "}
						<a
							class="text-teal-400 hover:underline"
							href={props.item.repo}
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
						.
					</Show>
				</p>
			</Show>
		</div>
	);
}
