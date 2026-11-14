import type { NodeViewProps as CoreNodeViewProps } from "@tiptap/core";

export type SolidNodeViewProps<T = HTMLElement> = CoreNodeViewProps & {
	ref: (element: T | null) => void;
};
