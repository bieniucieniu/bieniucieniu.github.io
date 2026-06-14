import tailwindcss from "@tailwindcss/vite";
import path from "path";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite-plus";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
	staged: {
		"*": "vp check --fix",
	},
	fmt: {
		useTabs: true,
		tabWidth: 2,
		printWidth: 80,
		singleQuote: false,
		jsxSingleQuote: false,
		quoteProps: "as-needed",
		trailingComma: "all",
		semi: true,
		arrowParens: "always",
		bracketSameLine: false,
		bracketSpacing: true,
		ignorePatterns: ["dist/**"],
	},
	lint: {
		ignorePatterns: ["dist/**"],
		options: {
			typeAware: true,
			typeCheck: true,
		},
		rules: {
			"@typescript-eslint/ban-types": "off",
			"no-cond-assign": "off",
		},
	},
	plugins: [
		devtools(),
		solidPlugin({
			include: [/\.(tsx|jsx)$/, /node_modules\/tiptap-solid\/.*\.(tsx|ts)$/],
		}),
		tailwindcss(),
	],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"~": path.resolve(__dirname, "./src"),
		},
	},
	server: {
		port: 3000,
	},
	build: {
		target: "esnext",
	},
});
