import { XYDrag, nodeHasDimensions, type XYDragInstance } from "@xyflow/system";
import {
	type JSX,
	Show,
	createEffect,
	createMemo,
	createSignal,
	on,
	onCleanup,
	onMount,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import { NodeIdContext, useFlow } from "../context";
import { cx } from "@/lib/utils/xyflow/cx";
import type { FlowNode } from "@/lib/xyflow/types";
import { builtinNodeTypes } from "./Nodes";

export function NodeView(props: {
	node: FlowNode;
	resizeObserver: ResizeObserver;
}) {
	const flow = useFlow();
	const [element, setElement] = createSignal<HTMLDivElement>();
	let drag: XYDragInstance | undefined;
	const [mounted, setMounted] = createSignal(false);

	const nodeType = () => props.node.type || "default";
	const draggable = () =>
		props.node.draggable === true ||
		(props.node.draggable === undefined && flow.nodesDraggable);
	const selectable = () =>
		props.node.selectable === true ||
		(props.node.selectable === undefined && flow.elementsSelectable);

	onMount(() => {
		drag = XYDrag({
			getStoreItems: () => flow.getStoreItems(),
			onNodeMouseDown: (id) => flow.handleNodeClick(id),
		});
		setMounted(true);
		onCleanup(() => {
			const node = element();
			if (node) props.resizeObserver.unobserve(node);
			drag?.destroy();
		});
	});

	createEffect(() => {
		const node = element();
		if (!node) return;
		props.resizeObserver.observe(node);
		onCleanup(() => props.resizeObserver.unobserve(node));
	});

	// `setNodes` with a new object for an id on screen drops `measured`, and the reused
	// element does not resize. Observing it again makes the observer report its size.
	const measured = createMemo(
		() =>
			props.node.measured?.width !== undefined &&
			props.node.measured?.height !== undefined,
	);
	createEffect(
		on(measured, (isMeasured, wasMeasured) => {
			const node = element();
			if (isMeasured || !wasMeasured || !node) return;
			props.resizeObserver.unobserve(node);
			props.resizeObserver.observe(node);
		}),
	);

	createEffect(() => {
		const node = element();
		if (!mounted() || !node || !drag || props.node.hidden || !draggable())
			return;
		drag.update({
			domNode: node,
			nodeId: props.node.id,
			noDragClassName: "nodrag",
			handleSelector: props.node.dragHandle,
			isSelectable: selectable(),
			nodeClickDistance: 0,
		});
		// Runs before the next update and when dragging is turned off or the node is hidden,
		// so a node that is no longer draggable has no drag listeners left.
		onCleanup(() => drag?.destroy());
	});

	const position = () =>
		props.node.internals?.positionAbsolute ?? props.node.position;

	return (
		<Show when={!props.node.hidden}>
			<div
				ref={setElement}
				class={cx(
					"xy-flow__node",
					`xy-flow__node-${nodeType()}`,
					props.node.class,
					{
						nopan: draggable(),
						selected: props.node.selected,
						selectable: selectable(),
						draggable: draggable(),
						dragging: props.node.dragging,
					},
				)}
				style={{
					"z-index": props.node.internals?.z ?? 0,
					transform: `translate(${position().x}px, ${position().y}px)`,
					"pointer-events": selectable() || draggable() ? "all" : "none",
					visibility: nodeHasDimensions(props.node) ? "visible" : "hidden",
					...props.node.style,
				}}
				data-id={props.node.id}
				data-testid={`rf__node-${props.node.id}`}
				onClick={(event) => {
					event.stopPropagation();
					if (selectable()) flow.handleNodeClick(props.node.id);
				}}
			>
				<NodeIdContext.Provider value={props.node.id}>
					<Dynamic
						component={
							flow.nodeTypes[nodeType()] ??
							builtinNodeTypes[nodeType() as keyof typeof builtinNodeTypes] ??
							builtinNodeTypes.default
						}
						node={props.node}
					/>
				</NodeIdContext.Provider>
			</div>
		</Show>
	);
}

export function nodeLayerStyle(): JSX.CSSProperties {
	return {
		position: "absolute",
		width: "100%",
		height: "100%",
		top: 0,
		left: 0,
	};
}
