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
	const el = document.getElementById(id);
	if (!el) return false;

	el.scrollIntoView({ behavior: "smooth" });
	window.history.replaceState(null, "", `#${id}`);
	return true;
}

export function scrollToHomeSectionWhenReady(id: HomeSectionId, attempts = 0) {
	if (scrollToHomeSection(id)) return;
	if (attempts >= 20) return;
	requestAnimationFrame(() => scrollToHomeSectionWhenReady(id, attempts + 1));
}
