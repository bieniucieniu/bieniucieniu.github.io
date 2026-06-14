import Layout, { Footer } from "~/components/layout";
import NavPageHeader from "~/components/nav-page-header";
import ProjectCard from "~/components/project-card";
import { projects } from "~/lib/data";

export default function ProjectsPage() {
	return (
		<Layout>
			<section class="flex flex-col gap-y-4 leading-relaxed text-slate-300 font-normal opacity-80">
				<NavPageHeader />
				<ul class="flex flex-col pl-10 group">
					{projects.map((project) => (
						<ProjectCard {...project} />
					))}
				</ul>
			</section>
			<section id="contacts">
				<Footer />
			</section>
		</Layout>
	);
}
