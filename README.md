# Portfolio

Personal portfolio site for [Mikołaj Bień](https://github.com/bieniucieniu).

Built with SolidJS, Vite+, Tailwind CSS and `@solidjs/router`. UI components, Tiptap, xyflow and Motion bindings come from the [solid-kit](https://github.com/bieniucieniu/solid-kit) shadcn registry (copied into `src/`, radius set to 0).

Add or update a component:

```bash
pnpm dlx shadcn@latest add bieniucieniu/solid-kit/<item>
```

## Development

Tooling comes from [devenv](https://devenv.sh): Node.js 24 and pnpm 12. Entering the shell runs `pnpm install`.

```bash
devenv shell
# or: direnv allow
devenv up          # dev server on http://localhost:3000
```

Without devenv, use Node.js 24 and pnpm 12:

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
pnpm serve
```
