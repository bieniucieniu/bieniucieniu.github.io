import { ExternalLink } from "lucide-solid";
import { For, Show } from "solid-js";
import { Badge, type BadgeVariant } from "@/components/ui/badge";
import {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { Project, Status } from "@/lib/data";

const statusVariant: Record<Status, BadgeVariant> = {
	live: "default",
	wip: "secondary",
	done: "outline",
};

const linkClass =
	"inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground";

export default function ProjectCard(props: Project) {
	return (
		<Card class="text-sm">
			<CardHeader>
				<CardTitle class="text-base font-bold">{props.title}</CardTitle>
				<Show when={props.status}>
					{(status) => (
						<CardAction>
							<Badge variant={statusVariant[status()]} class="h-6 px-2 text-xs">
								{status()}
							</Badge>
						</CardAction>
					)}
				</Show>
				<CardDescription class="text-sm/relaxed">
					{props.description}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<TagList tags={props.tags} />
			</CardContent>
			<Show when={props.link || props.repo}>
				<CardFooter class="gap-4 text-xs">
					<Show when={props.link}>
						<a
							href={props.link}
							target="_blank"
							rel="noreferrer"
							class={linkClass}
						>
							site <ExternalLink class="size-3" />
						</a>
					</Show>
					<Show when={props.repo}>
						<a
							href={props.repo}
							target="_blank"
							rel="noreferrer"
							class={linkClass}
						>
							source <ExternalLink class="size-3" />
						</a>
					</Show>
				</CardFooter>
			</Show>
		</Card>
	);
}

export function TagList(props: { tags: string[] }) {
	return (
		<ul class="flex flex-wrap gap-1.5">
			<For each={props.tags}>
				{(tag) => (
					<li>
						<Badge variant="outline" class="h-6 px-2 text-xs">
							{tag}
						</Badge>
					</li>
				)}
			</For>
		</ul>
	);
}
