import LinkCard, { type Link } from "./link-card";

const links: Link[] = [
	{
		id: "about",
		text: "about",
	},
	{
		id: "projects",
		text: "projects",
	},
	{
		id: "contacts",
		text: "contacts",
	},
];
export default function Nav({ className }: { className?: string }) {
	return (
		<nav class={className}>
			<ul class="w-max">
				{links.map((props) => (
					<LinkCard id={props.id} text={props.text} />
				))}
			</ul>
		</nav>
	);
}
