import { experiences } from "~/lib/data";

export default function Experience() {
	return (
		<>
			<h2 class="text-xl font-black text-teal-500/80 inline lg:hidden">
				Experience
			</h2>
			<ul class="flex flex-col gap-y-8 pl-10">
				{experiences.map((exp) => (
					<li class="flex flex-col gap-y-2">
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
					</li>
				))}
			</ul>
		</>
	);
}
