import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import type { Component } from "solid-js";
import { Tiptap, useEditor, useTiptap, useTiptapState } from "tiptap-solid";

const ToolbarButton: Component<{
	onClick: () => void;
	disabled?: boolean;
	isActive?: boolean;
	children: string;
}> = (props) => (
	<button
		type="button"
		onClick={props.onClick}
		disabled={props.disabled}
		class="rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
		classList={{
			"border-teal-500/50 bg-teal-500/20 text-teal-200": !!props.isActive,
			"border-slate-600 bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-slate-100":
				!props.isActive,
		}}
	>
		{props.children}
	</button>
);

function MenuBar() {
	const ctx = useTiptap();
	const states = useTiptapState({
		editor: () => ctx.editor,
		selector: (ctx) => ({
			isBold: ctx.editor.isActive("bold"),
			isItalic: ctx.editor.isActive("italic"),
			isHeading2: ctx.editor.isActive("heading", { level: 2 }),
			isBulletList: ctx.editor.isActive("bulletList"),
			canUndo: ctx.editor.can().chain().focus().undo().run(),
			canRedo: ctx.editor.can().chain().focus().redo().run(),
		}),
	});

	return (
		<div class="flex flex-wrap gap-1 border-b border-slate-700/80 bg-slate-900/60 p-2">
			<ToolbarButton
				onClick={() => ctx.editor.chain().focus().toggleBold().run()}
				isActive={states()?.isBold}
			>
				Bold
			</ToolbarButton>
			<ToolbarButton
				onClick={() => ctx.editor.chain().focus().toggleItalic().run()}
				isActive={states()?.isItalic}
			>
				Italic
			</ToolbarButton>
			<ToolbarButton
				onClick={() =>
					ctx.editor.chain().focus().toggleHeading({ level: 2 }).run()
				}
				isActive={states()?.isHeading2}
			>
				H2
			</ToolbarButton>
			<ToolbarButton
				onClick={() => ctx.editor.chain().focus().toggleBulletList().run()}
				isActive={states()?.isBulletList}
			>
				List
			</ToolbarButton>
			<ToolbarButton
				onClick={() => ctx.editor.chain().focus().undo().run()}
				disabled={!states()?.canUndo}
			>
				Undo
			</ToolbarButton>
			<ToolbarButton
				onClick={() => ctx.editor.chain().focus().redo().run()}
				disabled={!states()?.canRedo}
			>
				Redo
			</ToolbarButton>
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
      <h2>Tiptap Solid</h2>
      <p>A minimal demo of <strong>tiptap-solid</strong> from the libs catalog.</p>
    `,
	}));

	return (
		<div class="tiptap-editor overflow-hidden rounded-lg border border-slate-700/80 bg-slate-900/40 shadow-lg">
			<Tiptap editor={editor}>
				<MenuBar />
				<Tiptap.Content class="tiptap-content p-6" />
			</Tiptap>
		</div>
	);
}
