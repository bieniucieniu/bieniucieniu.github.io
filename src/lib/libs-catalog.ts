export type Lib = {
	slug: string;
	title: string;
	description: string;
	tags: string[];
	repo: string;
};

export const libs: Lib[] = [
	{
		slug: "tiptap",
		title: "tiptap-solid",
		description:
			"SolidJS components for Tiptap, aligned with @tiptap/react. Includes editor hooks, context, menus, and optional node-view renderers.",
		tags: ["solid", "tiptap", "typescript"],
		repo: "https://github.com/bieniucieniu/tiptap-solid",
	},
];

export function libPath(slug: string) {
	return `/libs#${slug}`;
}
