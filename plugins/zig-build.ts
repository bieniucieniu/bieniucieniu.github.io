import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";
import type { Logger, Plugin, ResolvedConfig } from "vite-plus";

export type ZigBuildOptions = {
	/** Directory holding build.zig, relative to the Vite root. */
	cwd: string;
	/** Where `zig build` installs, relative to `cwd` (zig's default prefix). */
	outDir?: string;
	/** Extra `zig build` arguments, e.g. `["-Doptimize=debug"]`. */
	args?: string[];
};

/**
 * Runs `zig build` as part of Vite:
 * - `vite build`: once, before bundling; a failed zig build fails the Vite build.
 * - `vite dev`: once before the server starts, then `zig build --watch`. Each
 *   rebuild that changes the install dir triggers one full page reload.
 * Not run for config-only loads (lint, fmt, check) or under Vitest.
 */
export function zigBuild(opts: ZigBuildOptions): Plugin {
	let config: ResolvedConfig;
	let cwd = "";
	let outDir = "";
	const args = opts.args ?? [];

	return {
		name: "zig-build",

		config() {
			// zig's caches and fetched packages churn thousands of files.
			return {
				server: {
					watch: {
						ignored: [
							`**/${opts.cwd}/.zig-cache/**`,
							`**/${opts.cwd}/zig-pkg/**`,
							"**/.devenv/**",
						],
					},
				},
			};
		},

		configResolved(resolved) {
			config = resolved;
			cwd = path.resolve(resolved.root, opts.cwd);
			outDir = path.resolve(cwd, opts.outDir ?? "zig-out");
		},

		async buildStart() {
			if (config.command !== "build") return;
			await zig(["build", ...args], cwd, config.logger);
		},

		async configureServer(server) {
			if (process.env.VITEST) return;
			const log = config.logger;

			// The page imports the build output, so build it before serving. A
			// compile error is logged but doesn't stop the server: the watcher
			// below retries on the next save.
			try {
				await zig(["build", ...args], cwd, log);
			} catch (error) {
				if (isMissingZig(error)) throw error;
				log.error(`[zig] ${(error as Error).message}`);
			}

			// One rebuild installs several files: reload once, shortly after.
			let timer: ReturnType<typeof setTimeout> | undefined;
			const reload = (why: string) => {
				clearTimeout(timer);
				timer = setTimeout(() => {
					log.info(`[zig] ${why}, reloading page`, { timestamp: true });
					server.ws.send({ type: "full-reload" });
				}, 100);
			};

			// --watch reports every rebuild with one summary line. Successful ones
			// are not logged (it also does no-op, fully cached rebuilds now and
			// then). A failure shows its errors in the terminal and the browser
			// overlay; the next success reloads to clear it, even when the output
			// is unchanged and the file watcher below sees nothing.
			let failing = false;
			const watcher = spawnZig(
				["build", "--watch", "--summary", "line", ...args],
				cwd,
				log,
				{
					onError(message) {
						failing = true;
						server.ws.send({
							type: "error",
							err: { message, stack: "", plugin: "zig-build" },
						});
					},
					onSuccess() {
						if (!failing) return;
						failing = false;
						reload("build fixed");
					},
				},
			);
			// Stop with the server (also on Vite's config-change restarts, which
			// would otherwise pile up exit listeners) or with the process.
			const stop = () => watcher.kill();
			process.once("exit", stop);
			server.httpServer?.once("close", () => {
				stop();
				process.off("exit", stop);
			});

			server.watcher.add(outDir);
			const onFile = (file: string) => {
				if (file.startsWith(outDir + path.sep)) reload("rebuilt");
			};
			server.watcher.on("add", onFile);
			server.watcher.on("change", onFile);
		},

		// The reload above covers the build output; skip Vite's own HMR for it.
		handleHotUpdate(ctx) {
			if (ctx.file.startsWith(outDir + path.sep)) return [];
		},
	};
}

/**
 * Spawns zig with its output forwarded to Vite's logger. A compile error's
 * lines are logged as errors and, once they settle, passed to `onError`.
 * "Build Summary: N/N steps succeeded" calls `onSuccess` and is not logged.
 */
function spawnZig(
	args: string[],
	cwd: string,
	log: Logger,
	on: { onError?(message: string): void; onSuccess?(): void } = {},
): ChildProcess {
	const child = spawn("zig", args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
	let errors: string[] = [];
	let timer: ReturnType<typeof setTimeout> | undefined;
	const forward = (chunk: Buffer) => {
		for (const line of chunk.toString().split("\n")) {
			if (!line.trim()) continue;
			if (/^Build Summary: (\d+)\/\1 steps succeeded/.test(line)) {
				on.onSuccess?.();
			} else if (/\berror:/.test(line) || errors.length > 0) {
				log.error(`[zig] ${line}`);
				// The full compiler command line adds nothing to the overlay.
				if (!line.startsWith("failed command:")) errors.push(line);
				clearTimeout(timer);
				timer = setTimeout(() => {
					on.onError?.(errors.join("\n"));
					errors = [];
				}, 200);
			} else {
				log.info(`[zig] ${line}`);
			}
		}
	};
	child.stdout?.on("data", forward);
	child.stderr?.on("data", forward);
	return child;
}

function zig(args: string[], cwd: string, log: Logger) {
	return new Promise<void>((resolve, reject) => {
		const child = spawnZig(args, cwd, log);
		child.on("error", (error: NodeJS.ErrnoException) =>
			reject(
				error.code === "ENOENT"
					? Object.assign(
							new Error(
								"zig not found on PATH: run inside the devenv shell (`devenv shell`)",
							),
							{ code: "ENOENT" },
						)
					: error,
			),
		);
		child.on("exit", (code) =>
			code === 0
				? resolve()
				: reject(new Error(`zig ${args.join(" ")} failed (exit ${code})`)),
		);
	});
}

function isMissingZig(error: unknown) {
	return (error as NodeJS.ErrnoException).code === "ENOENT";
}
