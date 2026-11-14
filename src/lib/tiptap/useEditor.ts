import { Editor, type EditorOptions } from "@tiptap/core";
import {
	type Accessor,
	createEffect,
	createSignal,
	on,
	onCleanup,
	onMount,
	untrack,
} from "solid-js";

const isSSR = typeof window === "undefined";
// Read `process` through globalThis so this type-checks with and without @types/node.
const nodeEnv = (
	globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env;
const isDev = nodeEnv !== undefined && nodeEnv.NODE_ENV !== "production";
const isNext =
	isSSR || Boolean(typeof window !== "undefined" && (window as any).next);

export type UseEditorOptions = Partial<EditorOptions> & {
	/**
	 * Whether to render the editor on the first render.
	 * If client-side rendering, set this to `true`.
	 * If server-side rendering, set this to `false`.
	 * @default true
	 */
	immediatelyRender?: boolean;
	/**
	 * Accepted for parity with Tiptap React and ignored: Solid has no component re-render.
	 * Read editor state with `useEditorState` instead.
	 * @default false
	 */
	shouldRerenderOnTransaction?: boolean;
};

function compareOptions(a: UseEditorOptions, b: UseEditorOptions) {
	const keys = Object.keys(a) as (keyof UseEditorOptions)[];
	return keys.every((key) => {
		if (
			[
				"onCreate",
				"onBeforeCreate",
				"onDestroy",
				"onUpdate",
				"onTransaction",
				"onFocus",
				"onBlur",
				"onSelectionUpdate",
				"onContentError",
				"onDrop",
				"onPaste",
			].includes(key)
		) {
			// we don't want to compare callbacks, they are always different and only registered once
			return true;
		}

		// We often encourage putting extensions inlined in the options object, so we will do a slightly deeper comparison here
		if (key === "extensions" && a.extensions && b.extensions) {
			if (a.extensions.length !== b.extensions.length) {
				return false;
			}
			return a.extensions.every((extension, index) => {
				return extension === b.extensions?.[index];
			});
		}

		if (a[key] !== b[key]) {
			// if any of the options have changed, we should update the editor options
			return false;
		}
		return true;
	});
}

function shouldRecreate(a: UseEditorOptions, b: UseEditorOptions) {
	if (a.extensions !== b.extensions) {
		if (!a.extensions || !b.extensions) {
			return true;
		}
		if (a.extensions.length !== b.extensions.length) {
			return true;
		}
		if (
			a.extensions.some(
				(extension, index) => extension !== b.extensions?.[index],
			)
		) {
			return true;
		}
	}
	return false;
}

export function useEditor(
	options: Accessor<UseEditorOptions & { immediatelyRender: false }>,
): Accessor<Editor | null>;
export function useEditor(
	options: Accessor<UseEditorOptions>,
): Accessor<Editor>;
export function useEditor(
	options: Accessor<UseEditorOptions> = () => ({}),
): Accessor<Editor | null> {
	const [editor, setEditor] = createSignal<Editor | null>(null);
	let instanceId = "";
	let isComponentMounted = false;
	let scheduledDestructionTimeout: ReturnType<typeof setTimeout> | undefined;

	const createEditorInstance = (opts: UseEditorOptions): Editor => {
		const instance = new Editor({
			...opts,
			// Always call the most recent version of the callback function by default
			onBeforeCreate: (...args) => options().onBeforeCreate?.(...args),
			onBlur: (...args) => options().onBlur?.(...args),
			onCreate: (...args) => options().onCreate?.(...args),
			onDestroy: (...args) => options().onDestroy?.(...args),
			onFocus: (...args) => options().onFocus?.(...args),
			onSelectionUpdate: (...args) => options().onSelectionUpdate?.(...args),
			onTransaction: (...args) => options().onTransaction?.(...args),
			onUpdate: (...args) => options().onUpdate?.(...args),
			onContentError: (...args) => options().onContentError?.(...args),
			onDrop: (...args) => options().onDrop?.(...args),
			onPaste: (...args) => options().onPaste?.(...args),
			onDelete: (...args) => options().onDelete?.(...args),
		});

		instanceId = Math.random().toString(36).slice(2, 9);
		return instance;
	};

	const refreshEditorInstance = (opts: UseEditorOptions) => {
		const currentInstance = untrack(editor);
		if (currentInstance && !currentInstance.isDestroyed) {
			currentInstance.destroy();
		}

		setEditor(createEditorInstance(opts));
	};

	const scheduleDestroy = (instance: Editor | null, id: string) => {
		if (!instance) {
			return;
		}

		scheduledDestructionTimeout = setTimeout(() => {
			if (isComponentMounted && instanceId === id) {
				// If still mounted on the following tick, with the same instanceId, do not destroy the editor
				// just re-apply options as they might have changed
				instance.setOptions(untrack(options));
				return;
			}

			if (!instance.isDestroyed) {
				instance.destroy();
				if (instanceId === id) {
					setEditor(null);
				}
			}
		}, 1);
	};

	// Initial creation logic
	const getInitialEditor = () => {
		const opts = untrack(options);
		if (opts.immediatelyRender === undefined) {
			if (isSSR || isNext) {
				if (isDev) {
					throw new Error(
						"Tiptap Error: SSR has been detected, please set `immediatelyRender` explicitly to `false` to avoid hydration mismatches.",
					);
				}
				return null;
			}
			return createEditorInstance(opts);
		}

		if (opts.immediatelyRender && isSSR && isDev) {
			throw new Error(
				"Tiptap Error: SSR has been detected, and `immediatelyRender` has been set to `true` this is an unsupported configuration that may result in errors, explicitly set `immediatelyRender` to `false` to avoid hydration mismatches.",
			);
		}

		if (opts.immediatelyRender) {
			return createEditorInstance(opts);
		}

		return null;
	};

	const initial = getInitialEditor();
	if (initial) {
		setEditor(initial);
	}

	onMount(() => {
		isComponentMounted = true;
		clearTimeout(scheduledDestructionTimeout);

		const instance = untrack(editor);
		if (!instance && !isSSR) {
			refreshEditorInstance(untrack(options));
		}
	});

	onCleanup(() => {
		isComponentMounted = false;
		scheduleDestroy(untrack(editor), instanceId);
	});

	// Re-sync options or recreate
	createEffect(
		on(
			options,
			(opts) => {
				const instance = untrack(editor);
				if (!instance || instance.isDestroyed) {
					if (isComponentMounted) {
						refreshEditorInstance(opts);
					}
					return;
				}

				if (shouldRecreate(opts, instance.options)) {
					refreshEditorInstance(opts);
				} else if (!compareOptions(opts, instance.options)) {
					instance.setOptions({
						...opts,
						editable: opts.editable ?? instance.isEditable,
					});
				}
			},
			{ defer: true },
		),
	);

	return editor;
}
