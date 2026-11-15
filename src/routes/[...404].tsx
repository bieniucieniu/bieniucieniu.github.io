import { Page, Section } from "@/components/layout";
import { TextLink } from "@/components/text-link";

export default function NotFound() {
	return (
		<Page>
			<Section title="Not found">
				<p class="text-sm text-muted-foreground">
					Nothing here. <TextLink href="/">Go home</TextLink>
				</p>
			</Section>
		</Page>
	);
}
