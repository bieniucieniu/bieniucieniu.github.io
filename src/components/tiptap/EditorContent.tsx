import type { Editor } from "@tiptap/core";
import type { ComponentProps } from "solid-js";
import {
	createEffect,
	createMemo,
	createSignal,
	For,
	onCleanup,
	splitProps,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Dynamic, Portal } from "solid-js/web";
import type {
	ContentComponent,
	ContentRenderer,
	EditorWithContentComponent,
} from "@/lib/tiptap/editor";

export interface EditorContentProps extends ComponentProps<"div"> {
	editor: Editor | null;
}

function getInstance(): ContentComponent {
	const [renderers, setRenderers] = createStore<
		Record<string, ContentRenderer | undefined>
	>({});

	return {
		renderers,
		setRenderer(id: string, renderer: ContentRenderer) {
			setRenderers(id, renderer);
		},
		removeRenderer(id: string) {
			setRenderers(id, undefined);
		},
	};
}

export const EditorContent = (props: EditorContentProps) => {
	let editorContentRef: HTMLDivElement | undefined;
	const [local, rest] = splitProps(props, ["editor"]);
	const [content, setContent] = createSignal<ContentComponent | null>(null);

	createEffect(() => {
		const editor: EditorWithContentComponent | null = local.editor;
		const element = editorContentRef;

		if (!editor || editor.isDestroyed || !element) {
			return;
		}

		if (editor.contentComponent && editor.isEditorContentInitialized) {
			return;
		}

		if (editor.view.dom?.parentNode) {
			element.append(...Array.from(editor.view.dom.parentNode.childNodes));
		}

		editor.setOptions({
			element,
		});

		const instance = getInstance();
		editor.contentComponent = instance;
		setContent(instance);
		editor.createNodeViews();
		editor.isEditorContentInitialized = true;

		onCleanup(() => {
			editor.isEditorContentInitialized = false;
			setContent(null);

			if (!editor.isDestroyed) {
				editor.view.setProps({
					nodeViews: {},
				});
			}

			editor.contentComponent = null;

			try {
				if (!editor.view.dom?.parentNode) {
					return;
				}

				const newElement = document.createElement("div");
				newElement.append(...Array.from(editor.view.dom.parentNode.childNodes));

				editor.setOptions({
					element: newElement,
				});
			} catch {
				// do nothing
			}
		});
	});

	const renderers = createMemo((): ContentRenderer[] => {
		const store = content()?.renderers;
		if (!store) {
			return [];
		}

		return Object.values(store).filter(
			(renderer): renderer is ContentRenderer => renderer != null,
		);
	});

	// Node views render here, so they are owned by EditorContent: they see its context
	// and are disposed when their renderer is removed.
	return (
		<>
			<div ref={editorContentRef} {...rest} />
			<For each={renderers()}>
				{(renderer) => (
					<Portal mount={renderer.element}>
						<Dynamic component={renderer.component} {...renderer.props} />
					</Portal>
				)}
			</For>
		</>
	);
};
