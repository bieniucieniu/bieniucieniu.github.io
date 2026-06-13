import Experience from "~/components/experience";
import Layout, { Footer } from "~/components/layout";
import NavPageHeader from "~/components/nav-page-header";

export default function ExperiencePage() {
	return (
		<Layout>
			<section class="flex flex-col gap-y-4 leading-relaxed text-slate-300 font-normal opacity-80">
				<NavPageHeader />
				<Experience />
			</section>
			<section id="contacts">
				<Footer />
			</section>
		</Layout>
	);
}
