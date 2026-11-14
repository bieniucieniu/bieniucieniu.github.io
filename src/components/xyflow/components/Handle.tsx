import {
	ConnectionMode,
	Position,
	XYHandle,
	getHostForElement,
	type Connection,
	type HandleType,
} from "@xyflow/system";
import { createEffect, splitProps, untrack } from "solid-js";
import { useFlow, useNodeId } from "../context";
import { cx } from "@/lib/utils/xyflow/cx";

export type HandleProps = {
	type?: HandleType;
	position?: Position;
	id?: string;
	class?: string;
	isConnectable?: boolean;
	isConnectableStart?: boolean;
	isConnectableEnd?: boolean;
	onConnect?: (connection: Connection) => void;
};

export function Handle(props: HandleProps) {
	const [, rest] = splitProps(props, [
		"type",
		"position",
		"id",
		"class",
		"isConnectable",
		"isConnectableStart",
		"isConnectableEnd",
		"onConnect",
	]);
	const flow = useFlow();
	const nodeId = useNodeId();
	let handleElement: HTMLDivElement | undefined;
	const type = () => props.type ?? "source";
	const position = () => props.position ?? Position.Top;
	const handleId = () => props.id ?? null;
	const connectable = () => {
		if (props.isConnectable === false) return false;
		const nodeConnectable = nodeId
			? flow.getNode(nodeId)?.connectable
			: undefined;
		if (nodeConnectable === false) return false;
		return flow.nodesConnectable;
	};

	createEffect(() => {
		const side = position();
		untrack(() => {
			const id = nodeId;
			const nodeElement = handleElement?.closest(".xy-flow__node");
			if (!id || !(nodeElement instanceof HTMLDivElement) || !side) return;
			flow.updateNodeInternals(
				new Map([[id, { id, nodeElement, force: true }]]),
			);
		});
	});
	const connectableStart = () => props.isConnectableStart !== false;
	const connectableEnd = () => props.isConnectableEnd !== false;

	const connectingFrom = () => {
		const from = flow.connection.fromHandle;
		return (
			!!from &&
			from.nodeId === nodeId &&
			from.id === handleId() &&
			from.type === type()
		);
	};
	const connectingTo = () => {
		const to = flow.connection.toHandle;
		return (
			!!to && to.nodeId === nodeId && to.id === handleId() && to.type === type()
		);
	};
	const clickConnecting = () => {
		const click = flow.connectionClickStartHandle;
		return (
			!!click &&
			click.nodeId === nodeId &&
			click.id === handleId() &&
			click.type === type()
		);
	};
	const connectionInProcess = () => !!flow.connection.fromHandle;
	const isPossibleEnd = () => {
		const from = flow.connection.fromHandle;
		if (!from) return true;
		return from.type !== type();
	};

	const finish = (connection: Connection) => {
		flow.connect(connection);
		props.onConnect?.(connection);
	};

	const onMouseDown = (event: MouseEvent) => {
		if (!nodeId || !connectable() || !connectableStart() || event.button !== 0)
			return;
		event.stopPropagation();
		XYHandle.onPointerDown(event, {
			handleDomNode: event.currentTarget as Element,
			autoPanOnConnect: true,
			connectionMode: ConnectionMode.Strict,
			connectionRadius: 20,
			domNode: flow.getStoreItems().domNode,
			nodeLookup: flow.nodeLookup,
			lib: "xy",
			isTarget: type() === "target",
			handleId: handleId(),
			nodeId,
			flowId: "1",
			panBy: (delta) => flow.panBy(delta),
			cancelConnection: () => flow.cancelConnection(),
			updateConnection: (connection) => flow.setConnection(connection),
			onConnect: finish,
			getTransform: () => flow.getStoreItems().transform,
			getFromHandle: () => flow.connection.fromHandle,
			autoPanSpeed: 15,
			dragThreshold: 1,
		});
	};

	const onClick = (event: MouseEvent) => {
		if (!nodeId || !connectable()) return;
		event.stopPropagation();
		const start = flow.connectionClickStartHandle;
		if (!start) {
			if (!connectableStart()) return;
			flow.setConnectionClickStart({ nodeId, type: type(), id: handleId() });
			return;
		}
		if (!connectableEnd()) return;
		const doc = getHostForElement(event.target);
		const result = XYHandle.isValid(event, {
			handle: { nodeId, id: handleId(), type: type() },
			connectionMode: ConnectionMode.Strict,
			fromNodeId: start.nodeId,
			fromHandleId: start.id,
			fromType: start.type,
			flowId: "1",
			doc,
			lib: "xy",
			nodeLookup: flow.nodeLookup,
		});
		if (result.isValid && result.connection) finish(result.connection);
		flow.setConnectionClickStart(null);
	};

	return (
		<div
			{...rest}
			ref={(el) => {
				handleElement = el;
			}}
			data-handleid={handleId()}
			data-nodeid={nodeId}
			data-handlepos={position()}
			data-id={nodeId ? `1-${nodeId}-${handleId()}-${type()}` : undefined}
			class={cx(
				"xy-flow__handle",
				`xy-flow__handle-${position()}`,
				"nodrag",
				"nopan",
				props.class,
				type(),
				{
					connectable: connectable(),
					connectablestart: connectableStart(),
					connectableend: connectableEnd(),
					connectingfrom: connectingFrom(),
					connectingto: connectingTo(),
					clickconnecting: clickConnecting(),
					connectionindicator:
						connectable() &&
						(!connectionInProcess() || isPossibleEnd()) &&
						(connectionInProcess() || !!flow.connectionClickStartHandle
							? connectableEnd()
							: connectableStart()),
					valid: connectingTo() && !!flow.connection.isValid,
				},
			)}
			onMouseDown={onMouseDown}
			onClick={onClick}
		/>
	);
}
