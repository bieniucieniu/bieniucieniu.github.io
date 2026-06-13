import Layout, { Footer } from "~/components/layout";
import ProjectCard from "~/components/project-card";
import { projects, skillCategories } from "~/lib/data";

export default function Home() {
	return (
		<Layout>
			<section
				id="about"
				class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
			>
				<About />
			</section>

			<section
				id="skills"
				class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80"
			>
				<Skills />
			</section>

			<section id="projects">
				<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
					Projects
				</h2>
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

function About() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				About
			</h2>
			<p>
				Results-driven Web Developer with over 3 years of experience
				specializing in scalable{" "}
				<span class="font-bold text-slate-100">React</span> and{" "}
				<span class="font-bold text-slate-100">TypeScript</span> applications.
				Expert in the{" "}
				<span class="font-bold text-slate-100">TanStack ecosystem</span> (Query,
				Form, Table, Router) for efficient data management and UI/UX
				optimization.
			</p>
			<p>
				Advanced DevOps expertise in building{" "}
				<span class="font-bold text-slate-100">GitLab CI/CD</span> pipelines and
				managing{" "}
				<span class="font-bold text-slate-100">Kubernetes</span> clusters via
				GitOps (<span class="font-bold text-slate-100">FluxCD</span>), delivering
				end-to-end solutions for complex transport and internal logistics tools.
				Experienced in cross-platform development with{" "}
				<span class="font-bold text-slate-100">React Native</span> and{" "}
				<span class="font-bold text-slate-100">Jetpack Compose</span>.
			</p>
		</>
	);
}

function Skills() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				Skills
			</h2>
			<ul class="flex flex-col gap-y-4 pl-10">
				{skillCategories.map((cat) => (
					<li class="flex flex-col gap-y-2">
						<h3 class="font-bold text-slate-100 text-sm">{cat.category}</h3>
						<ul class="flex flex-wrap gap-2">
							{cat.skills.map((skill) => (
								<li class="rounded-full font-bold backdrop-blur-md bg-slate-500/10 text-xs px-2 py-1">
									{skill}
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</>
	);
}
