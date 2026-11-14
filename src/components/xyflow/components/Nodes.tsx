import { Position } from "@xyflow/system";
import { Handle } from "./Handle";
import type { NodeComponentProps } from "@/lib/xyflow/types";

export function DefaultNode(props: NodeComponentProps) {
	return (
		<>
			<Handle
				type="target"
				position={props.node.targetPosition ?? Position.Top}
			/>
			{props.node.data.label as string}
			<Handle
				type="source"
				position={props.node.sourcePosition ?? Position.Bottom}
			/>
		</>
	);
}

export function InputNode(props: NodeComponentProps) {
	return (
		<>
			{props.node.data.label as string}
			<Handle
				type="source"
				position={props.node.sourcePosition ?? Position.Bottom}
			/>
		</>
	);
}

export function OutputNode(props: NodeComponentProps) {
	return (
		<>
			<Handle
				type="target"
				position={props.node.targetPosition ?? Position.Top}
			/>
			{props.node.data.label as string}
		</>
	);
}

export function GroupNode() {
	return null;
}

export const builtinNodeTypes = {
	default: DefaultNode,
	input: InputNode,
	output: OutputNode,
	group: GroupNode,
};
