import { For, Show } from "solid-js";
import { Page, Section } from "@/components/layout";
import ProjectCard from "@/components/project-card";
import { experiences } from "@/lib/data";

export default function ExperiencePage() {
	return (
		<Page>
			<Section title="Experience">
				<ol class="flex flex-col gap-10">
					<For each={experiences}>
						{(exp) => (
							<li class="flex flex-col gap-3">
								<div>
									<h3 class="font-bold">{exp.role}</h3>
									<p class="text-sm text-muted-foreground">
										{exp.company} · {exp.period}
									</p>
								</div>
								<ul class="ml-4 flex list-disc flex-col gap-1 text-sm">
									<For each={exp.highlights}>{(item) => <li>{item}</li>}</For>
								</ul>
								<Show when={exp.projects}>
									{(list) => (
										<div class="flex flex-col gap-3">
											<For each={list()}>
												{(project) => <ProjectCard {...project} />}
											</For>
										</div>
									)}
								</Show>
							</li>
						)}
					</For>
				</ol>
			</Section>
		</Page>
	);
}
