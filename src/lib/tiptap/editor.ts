import type { Editor } from "@tiptap/core";
import type { Component } from "solid-js";
import type { Store } from "solid-js/store";

export type AnyProps = Record<string, any>;

export type ContentRenderer<P extends AnyProps = AnyProps> = {
	id: string;
	element: HTMLElement;
	component: Component<P>;
	props: P;
};

export type EditorWithContentComponent<P extends AnyProps = AnyProps> =
	Editor & {
		contentComponent?: ContentComponent<P> | null;
		isEditorContentInitialized?: boolean;
	};

export type ContentComponent<P extends AnyProps = AnyProps> = {
	setRenderer(id: string, renderer: ContentRenderer<P>): void;
	removeRenderer(id: string): void;
	renderers: Readonly<Store<Record<string, ContentRenderer<P> | undefined>>>;
};
