# Portfolio

Personal portfolio site for [Mikołaj Bień](https://github.com/bieniucieniu).

Built with SolidJS, Vite+, Tailwind CSS and `@solidjs/router`. UI components, Tiptap, xyflow and Motion bindings come from the [solid-kit](https://github.com/bieniucieniu/solid-kit) shadcn registry (copied into `src/`, radius set to 0).

Add or update a component:

```bash
pnpm dlx shadcn@latest add bieniucieniu/solid-kit/<item>
```

The page background is a small Zig + raylib + Box2D game (`game/`, from [demo](https://github.com/bieniucieniu/demo)): chicks run for a seed wherever you click. It is built to wasm with emscripten into `game/zig-out/` and imported by `src/lib/chicks.ts`, so Vite bundles it with content-hashed file names. A Vite plugin (`plugins/zig-build.ts`) runs `zig build` before `vp build`, and `zig build --watch` during `vp dev` (reloading the page after each rebuild, compile errors in the browser overlay). `pnpm run build:game` builds it on its own. `cd game && zig build test` runs its tests.

## Development

Tooling comes from [devenv](https://devenv.sh): Node.js 24, pnpm 12, Zig 0.17 and emscripten. Entering the shell runs `pnpm install`.

```bash
devenv shell
# or: direnv allow
devenv up          # dev server on http://localhost:3000
```

Without devenv, use Node.js 24, pnpm 12, Zig 0.17 and emscripten (`EMCC` and `EM_SYSROOT` set, or `emcc` on PATH):

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm serve
```
