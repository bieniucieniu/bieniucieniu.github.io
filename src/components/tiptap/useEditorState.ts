import type { Editor } from "@tiptap/core";
import { deepEqual } from "fast-equals";
import {
	type Accessor,
	createEffect,
	createMemo,
	createSignal,
	onCleanup,
} from "solid-js";
import { useTiptapEditor } from "./Tiptap";

export type EditorStateSnapshot<TEditor extends Editor | null = Editor | null> =
	{
		editor: TEditor;
		transactionNumber: number;
	};

export type UseEditorStateOptions<
	TSelectorResult,
	TEditor extends Editor | null = Editor | null,
> = {
	/**
	 * The editor instance.
	 */
	editor?: Accessor<TEditor>;
	/**
	 * A selector function to determine the value to compare for re-rendering.
	 */
	selector: (context: EditorStateSnapshot<TEditor>) => TSelectorResult;
	/**
	 * A custom equality function to determine if the editor should re-render.
	 * @default `deepEqual` from `fast-equals`
	 */
	equalityFn?: (a: TSelectorResult, b: TSelectorResult | null) => boolean;
};

export function useEditorState<TSelectorResult>(
	options: UseEditorStateOptions<TSelectorResult, Editor | null>,
): Accessor<TSelectorResult> {
	const [transactionNumber, setTransactionNumber] = createSignal(0);
	const getEditor = useTiptapEditor(options.editor);

	createEffect(() => {
		const editor = getEditor();

		if (!editor) {
			return;
		}

		const handler = () => {
			setTransactionNumber((n) => n + 1);
		};

		editor.on("transaction", handler);

		onCleanup(() => {
			editor.off("transaction", handler);
		});
	});

	const selectedState = createMemo((prev: TSelectorResult | null) => {
		const editor = getEditor();
		const next = options.selector({
			editor,
			transactionNumber: transactionNumber(),
		});
		const equalityFn = options.equalityFn ?? deepEqual;

		if (prev != null && equalityFn(next, prev)) {
			return prev;
		}

		return next;
	}, null);

	return selectedState;
}
