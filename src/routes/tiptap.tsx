import { ErrorBoundary } from "solid-js";
import Layout from "~/components/layout";
import TiptapDemo from "~/components/tiptap-demo";

export default function TiptapPage() {
	return (
		<Layout>
			<section class="flex flex-col gap-y-4 leading-relaxed text-slate-300 font-normal opacity-80">
				<div>
					<h2 class="text-xl font-black text-teal-500/80">Tiptap Solid Demo</h2>
					<p class="text-sm text-slate-400 pt-2">
						Simple editor powered by{" "}
						<a
							class="text-teal-400 hover:underline"
							href="https://github.com/bieniucieniu/tiptap-solid"
							target="_blank"
							rel="noreferrer"
						>
							tiptap-solid
						</a>
						, installed from{" "}
						<a
							class="text-teal-400 hover:underline"
							href="https://github.com/bieniucieniu/tiptap-solid"
							target="_blank"
							rel="noreferrer"
						>
							GitHub
						</a>
						.
					</p>
				</div>
				<ErrorBoundary fallback={<></>}>
					<TiptapDemo />
				</ErrorBoundary>
			</section>
		</Layout>
	);
}
