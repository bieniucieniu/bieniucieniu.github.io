export const HOME_SECTIONS = [
	"about",
	"skills",
	"projects",
	"contacts",
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

export function parseHomeSectionHash(hash: string): HomeSectionId | null {
	const section = hash.replace("#", "");
	return HOME_SECTIONS.includes(section as HomeSectionId)
		? (section as HomeSectionId)
		: null;
}

export function scrollToHomeSection(id: HomeSectionId) {
	return scrollToAnchor(id);
}

export function scrollToHomeSectionWhenReady(id: HomeSectionId, attempts = 0) {
	scrollToAnchorWhenReady(id, attempts);
}

export function scrollToAnchor(id: string) {
	const el = document.getElementById(id);
	if (!el) return false;

	el.scrollIntoView({ behavior: "smooth" });
	window.history.replaceState(null, "", `#${id}`);
	return true;
}

export function scrollToAnchorWhenReady(id: string, attempts = 0) {
	if (scrollToAnchor(id)) return;
	if (attempts >= 20) return;
	requestAnimationFrame(() => scrollToAnchorWhenReady(id, attempts + 1));
}
