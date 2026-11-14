import {
	areSetsEqual,
	getEventPosition,
	getNodesInside,
	pointToRendererPoint,
	rendererPointToPoint,
	type EdgeChange,
	type NodeChange,
} from "@xyflow/system";
import { type JSX, Show } from "solid-js";
import { getSelectionChanges } from "@/lib/utils/xyflow/changes";
import { useFlow } from "../context";
import { cx } from "@/lib/utils/xyflow/cx";
import type { FlowEdge, FlowNode } from "@/lib/xyflow/types";

const layerStyle: JSX.CSSProperties = {
	position: "absolute",
	width: "100%",
	height: "100%",
	top: 0,
	left: 0,
};

export function Pane(props: { children: JSX.Element }) {
	const flow = useFlow();
	let container: HTMLDivElement | undefined;
	let bounds: DOMRect | undefined;
	let selectedNodeIds = new Set<string>();
	let selectedEdgeIds = new Set<string>();
	let moved = false;

	const selecting = () =>
		flow.elementsSelectable &&
		(flow.selectionKeyPressed || flow.selectionOnDrag);

	const onPointerDown = (event: PointerEvent) => {
		if (!selecting() || event.button !== 0) return;
		bounds = flow.getStoreItems().domNode?.getBoundingClientRect();
		if (!bounds || !container) return;
		const targetIsPane = event.target === container;
		if (!flow.selectionKeyPressed && !(flow.selectionOnDrag && targetIsPane))
			return;
		const point = getEventPosition(event, bounds);
		const start = pointToRendererPoint(point, flow.getStoreItems().transform);
		moved = false;
		selectedNodeIds = new Set();
		selectedEdgeIds = new Set();
		flow.setSelection(
			{
				x: point.x,
				y: point.y,
				width: 0,
				height: 0,
				startX: start.x,
				startY: start.y,
			},
			false,
		);
		if (!targetIsPane) {
			event.stopPropagation();
			event.preventDefault();
		}
	};

	const onPointerMove = (event: PointerEvent) => {
		const rect = flow.userSelectionRect;
		if (!bounds || !rect) return;
		const point = getEventPosition(event, bounds);
		const transform = flow.getStoreItems().transform;
		const screenStart = rendererPointToPoint(
			{ x: rect.startX, y: rect.startY },
			transform,
		);
		const distance = Math.hypot(
			point.x - screenStart.x,
			point.y - screenStart.y,
		);
		if (!moved && distance <= (flow.selectionKeyPressed ? 0 : 1)) return;
		if (!moved) flow.resetSelectedElements();
		moved = true;

		const next = {
			startX: rect.startX,
			startY: rect.startY,
			x: point.x < screenStart.x ? point.x : screenStart.x,
			y: point.y < screenStart.y ? point.y : screenStart.y,
			width: Math.abs(point.x - screenStart.x),
			height: Math.abs(point.y - screenStart.y),
		};
		const nextNodeIds = new Set(
			getNodesInside(flow.nodeLookup, next, transform, false, true).map(
				(node) => node.id,
			),
		);
		const nextEdgeIds = new Set<string>();
		for (const nodeId of nextNodeIds) {
			const connections = flow.connectionLookup.get(nodeId);
			if (!connections) continue;
			for (const connection of connections.values()) {
				if (flow.edgeLookup.get(connection.edgeId))
					nextEdgeIds.add(connection.edgeId);
			}
		}
		if (!areSetsEqual(selectedNodeIds, nextNodeIds)) {
			selectedNodeIds = nextNodeIds;
			flow.triggerNodeChanges(
				getSelectionChanges(
					flow.nodeLookup,
					nextNodeIds,
				) as NodeChange<FlowNode>[],
			);
		}
		if (!areSetsEqual(selectedEdgeIds, nextEdgeIds)) {
			selectedEdgeIds = nextEdgeIds;
			flow.triggerEdgeChanges(
				getSelectionChanges(
					flow.edgeLookup,
					nextEdgeIds,
				) as EdgeChange<FlowEdge>[],
			);
		}
		flow.setSelection(next, true);
	};

	const onPointerUp = (event: PointerEvent) => {
		if (!flow.userSelectionRect) return;
		const wasActive = flow.userSelectionActive;
		flow.setSelection(null, false);
		if (!wasActive && event.target === container) {
			flow.resetSelectedElements();
		}
		moved = false;
	};

	const onClick = (event: MouseEvent) => {
		if (event.target !== container || flow.connection.inProgress || selecting())
			return;
		flow.resetSelectedElements();
		flow.setConnectionClickStart(null);
	};

	return (
		<div
			ref={(el) => {
				container = el;
			}}
			class={cx("xy-flow__pane", {
				draggable: !selecting(),
				dragging: flow.paneDragging,
				selection: selecting(),
			})}
			style={layerStyle}
			onPointerDown={onPointerDown}
			onPointerMove={onPointerMove}
			onPointerUp={onPointerUp}
			onClick={onClick}
		>
			{props.children}
			<Show when={flow.userSelectionActive && flow.userSelectionRect}>
				{(rect) => (
					<div
						class="xy-flow__selection xy-flow__container"
						style={{
							width: `${rect().width}px`,
							height: `${rect().height}px`,
							transform: `translate(${rect().x}px, ${rect().y}px)`,
						}}
					/>
				)}
			</Show>
		</div>
	);
}
