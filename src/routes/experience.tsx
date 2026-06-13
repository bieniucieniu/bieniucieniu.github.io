import Experience from "~/components/experience";
import Layout, { Footer } from "~/components/layout";

export default function ExperiencePage() {
	return (
		<Layout>
			<section class="flex gap-y-3 flex-col leading-relaxed text-slate-300 font-normal opacity-80">
				<Experience />
			</section>
			<section id="contacts">
				<Footer />
			</section>
		</Layout>
	);
}
