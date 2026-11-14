import type {
	EdgeChange,
	NodeChange,
	NodeSelectionChange,
} from "@xyflow/system";
import type { FlowEdge, FlowNode } from "@/lib/xyflow/types";

function applyChanges<T extends { id: string }>(
	changes: Array<{ id?: string; type: string; index?: number; item?: T }>,
	elements: T[],
): T[] {
	const updated: T[] = [];
	const changesMap = new Map<
		string,
		Array<{ id?: string; type: string; index?: number; item?: T }>
	>();
	const additions: Array<{
		id?: string;
		type: string;
		index?: number;
		item?: T;
	}> = [];

	for (const change of changes) {
		if (change.type === "add") {
			additions.push(change);
			continue;
		}
		if (change.type === "remove" || change.type === "replace") {
			if (change.id) changesMap.set(change.id, [change]);
			continue;
		}
		if (!change.id) continue;
		const queued = changesMap.get(change.id);
		if (queued) queued.push(change);
		else changesMap.set(change.id, [change]);
	}

	for (const element of elements) {
		const elementChanges = changesMap.get(element.id);
		if (!elementChanges) {
			updated.push(element);
			continue;
		}
		if (elementChanges[0]?.type === "remove") continue;
		if (elementChanges[0]?.type === "replace" && elementChanges[0].item) {
			updated.push(elementChanges[0].item);
			continue;
		}
		const next = { ...element };
		for (const change of elementChanges) applyChange(change, next);
		updated.push(next);
	}

	for (const change of additions) {
		if (!change.item) continue;
		if (change.index !== undefined)
			updated.splice(change.index, 0, change.item);
		else updated.push(change.item);
	}

	return updated;
}

function applyChange(
	change: { type: string; [key: string]: unknown },
	element: Record<string, unknown>,
) {
	switch (change.type) {
		case "select":
			element.selected = change.selected;
			break;
		case "position":
			if (change.position !== undefined) element.position = change.position;
			if (change.dragging !== undefined) element.dragging = change.dragging;
			break;
		case "dimensions":
			if (change.dimensions !== undefined) {
				element.measured = { ...(change.dimensions as object) };
				if (change.setAttributes === true || change.setAttributes === "width") {
					element.width = (change.dimensions as { width?: number }).width;
				}
				if (
					change.setAttributes === true ||
					change.setAttributes === "height"
				) {
					element.height = (change.dimensions as { height?: number }).height;
				}
			}
			break;
		default:
			break;
	}
}

export function applyNodeChanges(
	changes: NodeChange<FlowNode>[],
	nodes: FlowNode[],
): FlowNode[] {
	return applyChanges(changes, nodes);
}

export function applyEdgeChanges(
	changes: EdgeChange<FlowEdge>[],
	edges: FlowEdge[],
): FlowEdge[] {
	return applyChanges(changes, edges);
}

export function createSelectionChange(
	id: string,
	selected: boolean,
): NodeSelectionChange {
	return { id, type: "select", selected };
}

export function getSelectionChanges(
	items: Map<string, { id: string; selected?: boolean }>,
	selectedIds: Set<string> = new Set(),
): Array<NodeSelectionChange> {
	const changes: Array<NodeSelectionChange> = [];
	for (const [id, item] of items) {
		const willBeSelected = selectedIds.has(id);
		if (
			!(item.selected === undefined && !willBeSelected) &&
			item.selected !== willBeSelected
		) {
			changes.push(createSelectionChange(item.id, willBeSelected));
		}
	}
	return changes;
}
