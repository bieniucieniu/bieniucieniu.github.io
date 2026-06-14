import { For, Show } from "solid-js";
import ProjectCard from "~/components/project-card";
import { experiences } from "~/lib/data";

export default function Experience() {
	return (
		<ul class="flex flex-col gap-y-8 pl-10">
			{experiences.map((exp) => (
				<li class="flex flex-col gap-y-4">
					<div>
						<h3 class="font-bold text-slate-100">{exp.role}</h3>
						<p class="text-sm text-slate-400">
							{exp.company} · {exp.period}
						</p>
					</div>
					<ul class="list-disc list-outside ml-4 flex flex-col gap-y-1 text-sm">
						{exp.highlights.map((item) => (
							<li>{item}</li>
						))}
					</ul>
					<Show when={exp.projectCategories?.length}>
						<ul class="flex flex-col gap-y-6">
							<For
								each={exp.projectCategories!.filter(
									(group) => group.projects.length,
								)}
							>
								{(group) => (
									<li class="flex flex-col gap-y-3">
										<h4 class="font-bold text-slate-100 text-sm">
											{group.category}
										</h4>
										<ul class="flex flex-col gap-y-4 group">
											<For each={group.projects}>
												{(project) => <ProjectCard {...project} />}
											</For>
										</ul>
									</li>
								)}
							</For>
						</ul>
					</Show>
				</li>
			))}
		</ul>
	);
}
