import type { Editor } from "@tiptap/core";
import type { ComponentProps, JSX } from "solid-js";
import { createContext, splitProps, useContext } from "solid-js";

import { EditorContent } from "./EditorContent";
import type { UseEditorOptions } from "@/lib/tiptap/useEditor";
import { useEditor } from "@/lib/tiptap/useEditor";

export type EditorContextValue = {
	get editor(): Editor | null;
};

export const EditorContext = createContext<EditorContextValue>({
	get editor() {
		return null;
	},
});

/**
 * A hook to get the current editor instance.
 */
export const useCurrentEditor = () => useContext(EditorContext);

export interface EditorProviderProps extends UseEditorOptions {
	children?: JSX.Element;
	slotBefore?: JSX.Element;
	slotAfter?: JSX.Element;
	editorContainerProps?: ComponentProps<"div">;
}

/**
 * This is the provider component for the editor.
 * It allows the editor to be accessible across the entire component tree
 * with `useCurrentEditor`.
 */
export function EditorProvider(props: EditorProviderProps) {
	const [, editorOptions] = splitProps(props, [
		"children",
		"slotAfter",
		"slotBefore",
		"editorContainerProps",
	]);
	// Spread so the accessor reads every option prop and `useEditor` re-syncs when one changes.
	const editor = useEditor(() => ({ ...editorOptions }));

	const contextValue = {
		get editor() {
			return editor();
		},
	};

	return (
		<EditorContext.Provider value={contextValue}>
			{props.slotBefore}
			<EditorContent
				editor={editor()}
				{...(props.editorContainerProps || {})}
			/>
			{props.children}
			{props.slotAfter}
		</EditorContext.Provider>
	);
}
