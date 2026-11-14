import type { Component, JSX } from "solid-js";
import type {
	Connection,
	ConnectionLineType,
	CoordinateExtent,
	EdgeBase,
	EdgeChange,
	FitViewOptionsBase,
	NodeBase,
	NodeChange,
	NodeHandleBounds,
	NodeOrigin,
	Viewport,
	XYPosition,
} from "@xyflow/system";

export type FlowNodeData = Record<string, unknown>;

export type FlowNode<Data extends FlowNodeData = FlowNodeData> =
	NodeBase<Data> & {
		class?: string;
		style?: JSX.CSSProperties;
		internals?: {
			positionAbsolute: XYPosition;
			z: number;
			handleBounds?: NodeHandleBounds;
		};
	};

export type FlowEdge<Data extends FlowNodeData = FlowNodeData> =
	EdgeBase<Data> & {
		label?: string;
		class?: string;
		style?: JSX.CSSProperties;
	};

export type NodeComponentProps = {
	node: FlowNode;
};

export type EdgeComponentProps = {
	edge: FlowEdge;
	sourceX: number;
	sourceY: number;
	targetX: number;
	targetY: number;
	sourcePosition: FlowNode["sourcePosition"];
	targetPosition: FlowNode["targetPosition"];
};

export type FlowOptions = {
	nodes?: FlowNode[];
	edges?: FlowEdge[];
	fitView?: boolean;
	fitViewOptions?: FitViewOptionsBase;
	minZoom?: number;
	maxZoom?: number;
	nodeOrigin?: NodeOrigin;
	nodeExtent?: CoordinateExtent;
	defaultViewport?: Viewport;
	nodesDraggable?: boolean;
	nodesConnectable?: boolean;
	elementsSelectable?: boolean;
	snapToGrid?: boolean;
	snapGrid?: [number, number];
	selectionOnDrag?: boolean;
	connectionLineType?: ConnectionLineType;
	onNodesChange?: (changes: NodeChange<FlowNode>[]) => void;
	onEdgesChange?: (changes: EdgeChange<FlowEdge>[]) => void;
	onConnect?: (connection: Connection) => void;
	nodeTypes?: Record<string, Component<NodeComponentProps>>;
	edgeTypes?: Record<string, Component<EdgeComponentProps>>;
};
