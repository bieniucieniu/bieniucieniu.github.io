import { For } from "solid-js";
import { Page, Section } from "@/components/layout";
import ProjectCard, { TagList } from "@/components/project-card";
import { TextLink } from "@/components/text-link";
import { projects, skills } from "@/lib/data";

export default function Home() {
	return (
		<Page>
			<Section title="About" id="about">
				<div class="flex flex-col gap-3 leading-relaxed">
					<p>
						I build web apps, mostly with React, TypeScript and the TanStack
						libraries. At work that means internal tools for transport and
						logistics, plus the GitLab CI/CD and Kubernetes setup they run on.
					</p>
					<p>
						In my spare time I write SolidJS libraries (
						<TextLink href="/libs">solid-kit</TextLink>
						), small Kotlin and Zig projects, and run a home k3s cluster.
					</p>
				</div>
			</Section>

			<Section title="Skills" id="skills">
				<dl class="grid gap-3 text-sm sm:grid-cols-[8rem_1fr]">
					<For each={skills}>
						{(group) => (
							<>
								<dt class="text-muted-foreground">{group.name}</dt>
								<dd>
									<TagList tags={group.skills} />
								</dd>
							</>
						)}
					</For>
				</dl>
			</Section>

			<Section title="Selected projects" id="projects">
				<div class="flex flex-col gap-4">
					<For each={projects.filter((p) => p.featured)}>
						{(project) => <ProjectCard {...project} />}
					</For>
				</div>
				<TextLink variant="quiet" href="/projects" class="text-sm">
					All projects →
				</TextLink>
			</Section>
		</Page>
	);
}
