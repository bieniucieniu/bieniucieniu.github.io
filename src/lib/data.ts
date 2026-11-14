export type Status = "live" | "wip" | "done";

export type Project = {
	title: string;
	description: string;
	tags: string[];
	status?: Status;
	link?: string;
	repo?: string;
	featured?: boolean;
};

export type Experience = {
	role: string;
	company: string;
	period: string;
	highlights: string[];
};

export type SkillGroup = {
	name: string;
	skills: string[];
};

export type Contact = { label: string; href: string };

const gh = (repo: string) => `https://github.com/bieniucieniu/${repo}`;

export const projects: Project[] = [
	{
		title: "solid-kit",
		description:
			"SolidJS ports of Tiptap, xyflow and Motion, plus shadcn-style UI and Material 3 registries. This site uses its components.",
		tags: ["SolidJS", "TypeScript", "Tailwind CSS", "shadcn registry"],
		status: "wip",
		link: "https://solid-kit.kurwidolek.com/",
		repo: gh("solid-kit"),
		featured: true,
	},
	{
		title: "cookbook",
		description:
			"Recipe app. Kotlin/Native Ktor API on Postgres, Solid web app with TanStack Router and Query, WorkOS login. UI built on solid-kit.",
		tags: ["Kotlin", "Ktor", "SolidJS", "TanStack", "Postgres"],
		status: "wip",
		link: "https://cookbook.kurwidolek.com/",
		repo: gh("cookbook"),
		featured: true,
	},
	{
		title: "infra",
		description:
			"Flux GitOps repo for my Raspberry Pi k3s cluster. It runs cookbook, solid-kit and breakout.",
		tags: ["Kubernetes", "k3s", "FluxCD", "Traefik"],
		status: "live",
		repo: gh("infra"),
		featured: true,
	},
	{
		title: "zula",
		description:
			"Starter kit for small-company apps: sign-in, a public company profile, and web and mobile shells on one API.",
		tags: ["Kotlin", "Ktor", "React", "Expo"],
		status: "wip",
		repo: gh("zula"),
	},
	{
		title: "Bracia Bień",
		description:
			"Website for my father's shop, with an admin page for managing the site's images. Images are uploaded with UploadThing, data is in Turso.",
		tags: ["Next.js", "Drizzle", "Turso", "shadcn/ui", "Framer Motion"],
		status: "live",
		link: "https://braciabien.pl/",
		repo: gh("bracia-bien"),
	},
	{
		title: "breakout",
		description:
			"Breakout game in React with react-three-fiber, p2 physics and zustand for state.",
		tags: ["React", "react-three-fiber", "p2", "vanilla-extract"],
		status: "done",
		link: "https://breakout.kurwidolek.com/",
		repo: gh("breakout"),
	},
	{
		title: "ball",
		description: "Ball and object physics simulation.",
		tags: ["Zig", "raylib"],
		status: "wip",
		repo: gh("ball"),
	},
];

export const experiences: Experience[] = [
	{
		role: "Software Developer",
		company: "Correct K. Błaszczyk i Wspólnicy",
		period: "04.2024 – present",
		highlights: [
			"Internal web apps in React and TypeScript.",
			"Infrastructure on Kubernetes and Docker, with GitOps CI/CD (GitLab CI/CD, FluxCD).",
			"Java and Kotlin services: React frontends on their APIs, Docker builds and CI/CD pipelines for them, and some backend code.",
		],
	},
	{
		role: "Frontend Developer (freelance)",
		company: "Self-employed",
		period: "2022 – 2024",
		highlights: ["Next.js and TypeScript websites for local businesses."],
	},
];

export const skills: SkillGroup[] = [
	{
		name: "Frontend",
		skills: [
			"TypeScript",
			"React",
			"Next.js",
			"SolidJS",
			"TanStack",
			"Tailwind CSS",
		],
	},
	{
		name: "Mobile",
		skills: ["React Native", "Jetpack Compose"],
	},
	{
		name: "Backend",
		skills: ["Kotlin", "Java", "Ktor", "Go", "Postgres"],
	},
	{
		name: "Infra",
		skills: ["Docker", "Kubernetes", "FluxCD", "GitLab CI/CD", "Linux", "Nix"],
	},
];

export const contacts: Contact[] = [
	{ label: "GitHub", href: "https://github.com/bieniucieniu" },
	{
		label: "LinkedIn",
		href: "https://www.linkedin.com/in/mikołaj-bień-6090b2237",
	},
	{ label: "bienmikolaj@gmail.com", href: "mailto:bienmikolaj@gmail.com" },
];
