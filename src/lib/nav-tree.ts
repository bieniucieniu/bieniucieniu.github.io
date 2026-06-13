import { libs, type Lib } from "~/lib/libs-catalog";
import type { HomeSectionId } from "~/lib/scroll-spy";

export type NavTreeItem = {
	name: string;
	href?: string;
	sectionId?: HomeSectionId;
	description?: string;
	repo?: string;
	tags?: string[];
	children?: NavTreeItem[];
	/** In-page anchor on the item's href route (e.g. lib slug on /libs) */
	anchorId?: string;
	/** Show children when the current path is under this href */
	branchHref?: string;
};

export const homeSections: NavTreeItem[] = [
	{ name: "about", sectionId: "about" },
	{ name: "skills", sectionId: "skills" },
	{ name: "projects", sectionId: "projects" },
	{ name: "contacts", sectionId: "contacts" },
];

export const navTree: NavTreeItem = {
	name: "home",
	href: "/",
	branchHref: "/",
	children: homeSections,
};

export const routeItems: NavTreeItem[] = [
	{ name: "experience", href: "/experience" },
	{
		name: "libs",
		href: "/libs",
		branchHref: "/libs",
		description: "Open-source libraries with live demos.",
		children: libs.map(libToNavItem),
	},
];

function libToNavItem(lib: Lib): NavTreeItem {
	return {
		name: lib.slug,
		href: "/libs",
		anchorId: lib.slug,
		description: lib.description,
		repo: lib.repo,
		tags: lib.tags,
	};
}

export function isOnNavBranch(pathname: string, branchHref: string) {
	if (branchHref === "/") {
		return pathname === "/";
	}
	return pathname === branchHref || pathname.startsWith(`${branchHref}/`);
}

export function findNavItemByPath(pathname: string): NavTreeItem | null {
	if (pathname === "/") return navTree;

	let match: NavTreeItem | null = null;
	let matchLength = -1;

	const check = (item: NavTreeItem) => {
		if (item.href && item.href !== "/") {
			const fits = pathname === item.href;
			if (fits && item.href.length > matchLength) {
				match = item;
				matchLength = item.href.length;
			}
		}
		item.children?.forEach(check);
	};

	[...homeSections, ...routeItems].forEach(check);

	return match;
}

export function getNavChildren(href: string): NavTreeItem[] {
	const route = routeItems.find((item) => item.href === href);
	return route?.children ?? [];
}

export function libTitle(item: NavTreeItem) {
	return libs.find((lib) => lib.slug === item.name)?.title ?? item.name;
}
