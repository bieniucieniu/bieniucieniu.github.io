import { For } from "solid-js";
import { Page, Section } from "@/components/layout";
import ProjectCard from "@/components/project-card";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
	return (
		<Page>
			<Section title="Projects">
				<p class="text-sm text-muted-foreground">
					Personal and side projects. More on{" "}
					<a
						href="https://github.com/bieniucieniu"
						target="_blank"
						rel="noreferrer"
						class="text-primary underline underline-offset-4"
					>
						GitHub
					</a>
					.
				</p>
				<div class="flex flex-col gap-4">
					<For each={projects}>{(project) => <ProjectCard {...project} />}</For>
				</div>
			</Section>
		</Page>
	);
}
