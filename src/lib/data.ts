import type { JSX } from "solid-js";

export type Experience = {
	role: string;
	company: string;
	period: string;
	highlights: string[];
	projectCategories?: ProjectCategory[];
};

export type SkillCategoryName =
	| "Web & Mobile"
	| "Backend & Libs"
	| "DevOps & Infrastructure";

export type ProjectCategory = {
	category: SkillCategoryName;
	projects: Project[];
};

export type Project = {
	title: string;
	content: JSX.Element;
	tags: string[];
	status?: (
		| "finished"
		| "suspended"
		| "in progress"
		| "not hosted"
		| "in production"
	)[];
	link?: string;
	repo?: string;
};

const workProjectCategories: ProjectCategory[] = [
	{
		category: "Web & Mobile",
		projects: [
			{
				title: "EUDR App",
				content:
					"Application for registering transport, orders, and materials with supplier data aggregation for EUDR compliance. Authored most of the frontend using TanStack Form and Query for instant load times and real-time, error-aware validation. Scaled the system off an external development team and integrated a stable Go backend for transport validation document printing. Participated in DevOps setup and API design. Used daily by purchasing department teams as the primary source for transport and order information.",
				tags: ["React", "TypeScript", "TanStack Query", "TanStack Form", "Go"],
				status: ["in production"],
			},
			{
				title: "TMS System",
				content:
					"Transport Management System modules enhanced for UI/UX and readability, with comprehensive documentation for user training and cross-team collaboration.",
				tags: ["React", "TypeScript"],
				status: ["in production"],
			},
		],
	},
];

export const experiences: Experience[] = [
	{
		role: "Software Developer",
		company: "Correct K. Błaszczyk i Wspólnicy Spółka",
		period: "04.2024 – Present",
		highlights: [
			"Developed internal data collection forms with React Native and Jetpack Compose.",
			"Led GitOps CI/CD setup (GitLab CI/CD, Kubernetes, FluxCD), accelerating deployments 2–3× for internal testing.",
		],
		projectCategories: workProjectCategories,
	},
	{
		role: "Frontend Developer (Freelance)",
		company: "Self-Employed",
		period: "2022 – 2024",
		highlights: [
			"Built responsive Next.js/TypeScript web applications for local business clients.",
			"Achieved Lighthouse performance scores of 95+ by optimizing Core Web Vitals.",
		],
	},
];

export type SkillCategory = {
	category: SkillCategoryName;
	skills: string[];
};

export const skillCategories: SkillCategory[] = [
	{
		category: "Web & Mobile",
		skills: [
			"React",
			"Next.js",
			"TanStack Start",
			"Solid.js",
			"TypeScript",
			"Tailwind CSS",
			"TanStack Router",
			"Jetpack Compose",
			"React Native",
		],
	},
	{
		category: "Backend & Libs",
		skills: [
			"Go",
			"Kotlin",
			"TanStack Query",
			"TanStack Form",
			"TanStack Table",
		],
	},
	{
		category: "DevOps & Infrastructure",
		skills: [
			"Git",
			"GitLab CI/CD",
			"Docker",
			"Kubernetes",
			"FluxCD",
			"OpenAPI/Swagger UI",
			"Linux",
		],
	},
];

export const projects: Project[] = [
	{
		title: "kong",
		content:
			"ai agent with a chatbot and integration with git hosting (github, gitea) and posibly with smart home automation",
		tags: ["kotlin", "koog", "shadcn-ui", "tanstack"],
		status: ["in progress", "not hosted"],
		repo: "https://github.com/bieniucieniu/kong",
	},
	{
		title: "Bracia Bien",
		content: `
          This is a web page for my father's shop. It features fully dynamic
          images stored on a bucket and managed through a Postgres database on
          the admin page.
`,
		tags: ["next.js 13", "shadcn", "framer motion"],
		status: ["in progress"],
		link: "https://braciabien.pl/",
		repo: "https://github.com/bieniucieniu/bracia-bien",
	},
	{
		title: "Breakout",
		content:
			"2D/3D game leveraging vanilla React and the react-three-fiber library for 3D rendering with JSX templating and React. Implemented 2D physics with react and utilities from three-fiber and state management with zustand.",
		tags: ["three.js", "vanilla-extract-css"],
		status: ["finished"],
		link: "https://breakout.bieniucieniu.pl/",
		repo: "https://github.com/bieniucieniu/breakout",
	},
	{
		title: "ball",
		content: "zig + raylib balls physics simulation",
		status: ["in progress", "not hosted"],
		tags: ["zig", "raylib"],
		repo: "https://github.com/bieniucieniu/bracia-bien",
	},
	{
		title: "sorting",
		content: `This is my first real project with vanilla JS/TS, which utilizes
                HTML canvas to visualize four sorting algorithms.`,
		tags: ["vanilla js"],
		status: ["finished"],
		link: "https://sorting.bieniucieniu.pl/",
		repo: "https://github.com/bieniucieniu/sorting",
	},
	{
		title: "no esta bien",
		content:
			"puzzle game based on notpron, writen in go, gofiber, and vanilla html and css. \n Currently only one level and basic auth on jwt.",
		tags: ["go", "go fiber", "html", "css"],
		status: ["suspended", "not hosted"],
		link: "https://github.com/bieniucieniu/noestabien",
		repo: "https://github.com/bieniucieniu/noestabien",
	},
];

export type Contact = { label: string; href: string; hrefLabel: string };

export const contacts: Contact[] = [
	{
		label: "github",
		href: "https://github.com/bieniucieniu",
		hrefLabel: "github.com/bieniucieniu",
	},
	{
		label: "bienmikolaj@gmail.com",
		href: "mailto:bienmikolaj@gmail.com",
		hrefLabel: "bienmikolaj@gmail.com",
	},
	{
		label: "linkedin",
		href: "https://www.linkedin.com/in/mikołaj-bień-6090b2237",
		hrefLabel: "www.linkedin.com/in/mikołaj-bień-6090b2237",
	},
];
