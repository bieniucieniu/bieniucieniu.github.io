import { A } from "@solidjs/router";
import { Page, Section } from "@/components/layout";

export default function NotFound() {
	return (
		<Page>
			<Section title="Not found">
				<p class="text-sm text-muted-foreground">
					Nothing here.{" "}
					<A href="/" class="text-primary underline underline-offset-4">
						Go home
					</A>
				</p>
			</Section>
		</Page>
	);
}
