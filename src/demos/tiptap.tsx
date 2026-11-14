import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import { For } from "solid-js";
import {
	Tiptap,
	TiptapContent,
	useEditor,
	useTiptap,
	useTiptapState,
} from "@/components/tiptap";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Toggle } from "@/components/ui/toggle";

const marks = [
	{ name: "bold", label: "B", class: "font-bold" },
	{ name: "italic", label: "I", class: "italic" },
	{ name: "strike", label: "S", class: "line-through" },
	{ name: "code", label: "</>", class: "font-mono" },
] as const;

/** Keeps the editor selection when a toolbar control is pressed. */
const keepSelection = (event: MouseEvent) => event.preventDefault();

function MenuBar() {
	const ctx = useTiptap();
	const state = useTiptapState({
		editor: () => ctx.editor,
		selector: ({ editor }) => ({
			bold: editor?.isActive("bold") ?? false,
			italic: editor?.isActive("italic") ?? false,
			strike: editor?.isActive("strike") ?? false,
			code: editor?.isActive("code") ?? false,
			h2: editor?.isActive("heading", { level: 2 }) ?? false,
			list: editor?.isActive("bulletList") ?? false,
			canUndo: editor?.can().chain().focus().undo().run() ?? false,
			canRedo: editor?.can().chain().focus().redo().run() ?? false,
		}),
	});
	const chain = () => ctx.editor.chain().focus();

	return (
		<div
			role="toolbar"
			aria-label="Formatting"
			class="flex flex-wrap gap-2 border-b border-border bg-muted/40 p-2"
		>
			<ButtonGroup aria-label="Text style">
				<For each={marks}>
					{(mark) => (
						<Toggle
							variant="outline"
							aria-label={mark.name}
							pressed={state()?.[mark.name] ?? false}
							onChange={() => chain().toggleMark(mark.name).run()}
							onMouseDown={keepSelection}
						>
							<span class={mark.class}>{mark.label}</span>
						</Toggle>
					)}
				</For>
			</ButtonGroup>
			<ButtonGroup aria-label="Blocks">
				<Toggle
					variant="outline"
					aria-label="Heading"
					pressed={state()?.h2 ?? false}
					onChange={() => chain().toggleHeading({ level: 2 }).run()}
					onMouseDown={keepSelection}
				>
					H2
				</Toggle>
				<Toggle
					variant="outline"
					aria-label="Bullet list"
					pressed={state()?.list ?? false}
					onChange={() => chain().toggleBulletList().run()}
					onMouseDown={keepSelection}
				>
					List
				</Toggle>
			</ButtonGroup>
			<ButtonGroup aria-label="History">
				<Button
					variant="outline"
					disabled={!state()?.canUndo}
					onMouseDown={keepSelection}
					onClick={() => chain().undo().run()}
				>
					Undo
				</Button>
				<Button
					variant="outline"
					disabled={!state()?.canRedo}
					onMouseDown={keepSelection}
					onClick={() => chain().redo().run()}
				>
					Redo
				</Button>
			</ButtonGroup>
		</div>
	);
}

export default function TiptapDemo() {
	const editor = useEditor(() => ({
		extensions: [
			StarterKit,
			Placeholder.configure({ placeholder: "Write something..." }),
		],
		content: `
			<h2>Tiptap in Solid</h2>
			<p>Same hooks and components as <code>@tiptap/react</code>. Try the toolbar.</p>
		`,
	}));

	return (
		<div class="tiptap-editor">
			<Tiptap editor={editor}>
				<MenuBar />
				<TiptapContent />
			</Tiptap>
		</div>
	);
}
