import tailwindcss from "@tailwindcss/vite";
import path from "path";
import devtools from "solid-devtools/vite";
import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
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
