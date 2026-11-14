import type { Editor } from "@tiptap/core";
import type { JSX } from "solid-js";
import { type Accessor, createContext, useContext } from "solid-js";
import { EditorContext } from "./Context";
import { EditorContent, type EditorContentProps } from "./EditorContent";
import { type EditorStateSnapshot, useEditorState } from "./useEditorState";

/**
 * The shape of the Solid context used by the `<Tiptap />` components.
 */
export type TiptapContextType = {
	/** The Tiptap editor instance. */
	get editor(): Editor;
};

/**
 * Solid context that stores the current editor instance.
 */
export const TiptapContext = createContext<TiptapContextType>();

/**
 * Hook to read the Tiptap context and access the editor instance.
 */
export const useTiptap = () => {
	const ctx = useContext(TiptapContext);
	if (!ctx) {
		throw new Error("useTiptap must be used within a <Tiptap> provider");
	}
	return ctx;
};
export function useTiptapEditor<TEditor extends Editor | null = Editor | null>(
	e: Accessor<TEditor>,
): Accessor<TEditor>;
export function useTiptapEditor<TEditor extends Editor | null = Editor | null>(
	e?: Accessor<TEditor>,
): Accessor<TEditor | null>;
export function useTiptapEditor(
	e?: Accessor<Editor | null>,
): Accessor<Editor | null> {
	const tiptapCtx = useContext(TiptapContext);
	const legacyCtx = useContext(EditorContext);
	return () => {
		const fromAccessor = e?.();
		if (fromAccessor != null) {
			return fromAccessor;
		}
		if (tiptapCtx) {
			return tiptapCtx.editor;
		}
		return legacyCtx.editor;
	};
}

/**
 * Options for the `useTiptapState` hook.
 */
export type UseTiptapStateOptions<
	TSelectorResult,
	TEditor extends Editor | null,
> = {
	/**
	 * The editor instance. If not provided, it will use the editor from the Tiptap context.
	 */
	editor: Accessor<TEditor>;
	/**
	 * A selector function to determine the value to compare for re-rendering.
	 */
	selector: (context: EditorStateSnapshot<TEditor>) => TSelectorResult;
	/**
	 * A custom equality function to determine if the component should re-render.
	 */
	equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};
/**
 * Options for the `useTiptapState` hook.
 */
export type UseTiptapStateNullableOptions<TSelectorResult> = {
	/**
	 * The editor instance. If not provided, it will use the editor from the Tiptap context.
	 */
	editor?: never;
	/**
	 * A selector function to determine the value to compare for re-rendering.
	 */
	selector: (context: EditorStateSnapshot<Editor | null>) => TSelectorResult;
	/**
	 * A custom equality function to determine if the component should re-render.
	 */
	equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};

/**
 * Select a slice of the editor state using the context-provided editor.
 */
export function useTiptapState<TSelectorResult, TEditor extends Editor | null>(
	options: UseTiptapStateOptions<TSelectorResult, TEditor>,
): Accessor<TSelectorResult>;
export function useTiptapState<TSelectorResult>(
	options: UseTiptapStateNullableOptions<TSelectorResult>,
): Accessor<TSelectorResult>;
export function useTiptapState(
	options: UseTiptapStateNullableOptions<any> | UseTiptapStateOptions<any, any>,
) {
	const editor = useTiptapEditor(options.editor);

	return useEditorState({
		editor,
		selector: options.selector,
		equalityFn: options.equalityFn,
	});
}

/**
 * Props for the `Tiptap` root/provider component.
 */
export type TiptapWrapperProps = {
	editor: Accessor<Editor | null>;
	children: JSX.Element;
};

/**
 * Top-level provider component.
 */
export function Tiptap(props: TiptapWrapperProps) {
	const tiptapContextValue = {
		get editor() {
			const e = props.editor();
			if (!e) throw new Error("Tiptap: An editor instance is required.");
			return e;
		},
	};

	const legacyContextValue = {
		get editor() {
			return props.editor();
		},
	};

	return (
		<EditorContext.Provider value={legacyContextValue}>
			<TiptapContext.Provider value={tiptapContextValue}>
				{props.children}
			</TiptapContext.Provider>
		</EditorContext.Provider>
	);
}

/**
 * Convenience component that renders `EditorContent`.
 */
export function TiptapContent(props: Omit<EditorContentProps, "editor">) {
	const ctx = useTiptap();

	return <EditorContent editor={ctx.editor} {...props} />;
}

export default Tiptap;
