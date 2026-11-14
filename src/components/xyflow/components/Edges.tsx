import {
	ConnectionLineType,
	ConnectionMode,
	Position,
	getBezierPath,
	getConnectionStatus,
	getEdgePosition,
	getElevatedEdgeZIndex,
	getSmoothStepPath,
	getStraightPath,
	pointToRendererPoint,
} from "@xyflow/system";
import { Show, createMemo } from "solid-js";
import { Dynamic } from "solid-js/web";
import { useFlow } from "../context";
import { cx } from "@/lib/utils/xyflow/cx";
import type { EdgeComponentProps, FlowEdge } from "@/lib/xyflow/types";

export function BaseEdge(props: {
	path: string;
	interactionWidth?: number;
	style?: FlowEdge["style"];
}) {
	return (
		<>
			<path
				d={props.path}
				fill="none"
				class="xy-flow__edge-path"
				style={props.style}
			/>
			<path
				d={props.path}
				fill="none"
				stroke-opacity="0"
				stroke-width={props.interactionWidth ?? 20}
				class="xy-flow__edge-interaction"
			/>
		</>
	);
}

function pathFor(props: EdgeComponentProps) {
	const sourcePosition = props.sourcePosition ?? Position.Bottom;
	const targetPosition = props.targetPosition ?? Position.Top;
	if (props.edge.type === "straight") {
		return getStraightPath({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
		})[0];
	}
	if (props.edge.type === "step") {
		return getSmoothStepPath({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition,
			targetPosition,
			borderRadius: 0,
		})[0];
	}
	if (props.edge.type === "smoothstep") {
		return getSmoothStepPath({
			sourceX: props.sourceX,
			sourceY: props.sourceY,
			targetX: props.targetX,
			targetY: props.targetY,
			sourcePosition,
			targetPosition,
		})[0];
	}
	return getBezierPath({
		sourceX: props.sourceX,
		sourceY: props.sourceY,
		targetX: props.targetX,
		targetY: props.targetY,
		sourcePosition,
		targetPosition,
	})[0];
}

export function BuiltinEdge(props: EdgeComponentProps) {
	return <BaseEdge path={pathFor(props)} style={props.edge.style} />;
}

export const builtinEdgeTypes = {
	default: BuiltinEdge,
	straight: BuiltinEdge,
	step: BuiltinEdge,
	smoothstep: BuiltinEdge,
};

function trackHandleBounds(node: {
	internals?: {
		handleBounds?: { source: unknown[] | null; target: unknown[] | null };
	};
}) {
	const bounds = node.internals?.handleBounds;
	const lists = [bounds?.source, bounds?.target];
	for (const list of lists) {
		const count = list?.length ?? 0;
		for (let index = 0; index < count; index += 1) {
			const handle = list?.[index] as
				| {
						x?: number;
						y?: number;
						width?: number;
						height?: number;
						position?: string;
				  }
				| undefined;
			if (!handle) continue;
			void handle.x;
			void handle.y;
			void handle.width;
			void handle.height;
			void handle.position;
		}
	}
}

const containerStyle = {
	position: "absolute",
	width: "100%",
	height: "100%",
	top: "0",
	left: "0",
} as const;

export function EdgeView(props: { edge: FlowEdge }) {
	const flow = useFlow();
	const geometry = createMemo(() => {
		const source = flow.getNode(props.edge.source);
		const target = flow.getNode(props.edge.target);
		if (!source || !target) return null;
		trackHandleBounds(source);
		trackHandleBounds(target);
		const sourceX = source.internals?.positionAbsolute.x;
		const sourceY = source.internals?.positionAbsolute.y;
		const targetX = target.internals?.positionAbsolute.x;
		const targetY = target.internals?.positionAbsolute.y;
		if (
			sourceX === undefined ||
			sourceY === undefined ||
			targetX === undefined ||
			targetY === undefined ||
			source.measured?.width === undefined ||
			target.measured?.width === undefined
		) {
			return null;
		}
		const sourceNode = flow.nodeLookup.get(props.edge.source);
		const targetNode = flow.nodeLookup.get(props.edge.target);
		if (!sourceNode || !targetNode) return null;
		const position = getEdgePosition({
			id: props.edge.id,
			sourceNode,
			targetNode,
			sourceHandle: props.edge.sourceHandle ?? null,
			targetHandle: props.edge.targetHandle ?? null,
			connectionMode: ConnectionMode.Strict,
		});
		if (!position) return null;
		return {
			...position,
			zIndex: getElevatedEdgeZIndex({
				selected: props.edge.selected,
				zIndex: props.edge.zIndex,
				sourceNode,
				targetNode,
				elevateOnSelect: true,
				zIndexMode: "basic",
			}),
		};
	});

	const onClick = (event: MouseEvent) => {
		event.stopPropagation();
		flow.addSelectedEdges([props.edge.id]);
	};

	return (
		<Show when={geometry()}>
			{(geo) => (
				<svg
					style={{
						"z-index": geo().zIndex,
						overflow: "visible",
						position: "absolute",
					}}
				>
					<g
						class={cx(
							"xy-flow__edge",
							`xy-flow__edge-${props.edge.type || "default"}`,
							"nopan",
							props.edge.class,
							{
								selected: props.edge.selected,
								animated: props.edge.animated,
								selectable:
									props.edge.selectable !== false && flow.elementsSelectable,
							},
						)}
						data-id={props.edge.id}
						data-testid={`rf__edge-${props.edge.id}`}
						on:click={onClick}
					>
						<Dynamic
							component={
								flow.edgeTypes[props.edge.type || "default"] ??
								builtinEdgeTypes[
									(props.edge.type ||
										"default") as keyof typeof builtinEdgeTypes
								] ??
								builtinEdgeTypes.default
							}
							edge={props.edge}
							sourceX={geo().sourceX}
							sourceY={geo().sourceY}
							targetX={geo().targetX}
							targetY={geo().targetY}
							sourcePosition={geo().sourcePosition}
							targetPosition={geo().targetPosition}
						/>
					</g>
				</svg>
			)}
		</Show>
	);
}

export function ConnectionLine() {
	const flow = useFlow();
	const path = createMemo(() => {
		const connection = flow.connection;
		if (!connection.inProgress) return "";
		const to = pointToRendererPoint(connection.to, flow.transform);
		const params = {
			sourceX: connection.from.x,
			sourceY: connection.from.y,
			sourcePosition: connection.fromPosition,
			targetX: to.x,
			targetY: to.y,
			targetPosition: connection.toPosition,
		};
		const type = flow.connectionLineType;
		if (type === ConnectionLineType.Straight) return getStraightPath(params)[0];
		if (type === ConnectionLineType.Step)
			return getSmoothStepPath({ ...params, borderRadius: 0 })[0];
		if (type === ConnectionLineType.SmoothStep)
			return getSmoothStepPath(params)[0];
		return getBezierPath(params)[0];
	});

	return (
		<Show
			when={flow.connection.inProgress && flow.width && flow.nodesConnectable}
		>
			<svg
				width={flow.width}
				height={flow.height}
				class={cx(
					"xy-flow__connectionline",
					"xy-flow__container",
					getConnectionStatus(flow.connection.isValid) ?? false,
				)}
				style={containerStyle}
			>
				<path d={path()} class="xy-flow__connection-path" fill="none" />
			</svg>
		</Show>
	);
}
