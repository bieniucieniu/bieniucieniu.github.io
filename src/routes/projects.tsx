import { For } from "solid-js";
import { Page, Section } from "@/components/layout";
import ProjectCard from "@/components/project-card";
import { TextLink } from "@/components/text-link";
import { projects } from "@/lib/data";

export default function ProjectsPage() {
	return (
		<Page>
			<Section title="Projects">
				<p class="text-sm text-muted-foreground">
					Personal and side projects. More on{" "}
					<TextLink href="https://github.com/bieniucieniu">GitHub</TextLink>.
				</p>
				<div class="flex flex-col gap-4">
					<For each={projects}>{(project) => <ProjectCard {...project} />}</For>
				</div>
			</Section>
		</Page>
	);
}
