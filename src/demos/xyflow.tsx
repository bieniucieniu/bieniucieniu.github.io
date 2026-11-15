import { createFlow, Flow, Position } from "@/components/xyflow";
import { Background, Controls } from "@/components/xyflow/panels";
import "@/components/xyflow/style.css";
import "./xyflow.css";

const right = { sourcePosition: Position.Right, targetPosition: Position.Left };

export default function XyflowDemo() {
	const flow = createFlow(() => ({
		nodes: [
			{
				id: "registry",
				type: "input",
				position: { x: 0, y: 70 },
				sourcePosition: Position.Right,
				data: { label: "solid-kit registry" },
			},
			{
				id: "cli",
				position: { x: 200, y: 70 },
				...right,
				data: { label: "shadcn CLI" },
			},
			{
				id: "site",
				type: "output",
				position: { x: 400, y: 0 },
				targetPosition: Position.Left,
				data: { label: "this site" },
			},
			{
				id: "cookbook",
				type: "output",
				position: { x: 400, y: 140 },
				targetPosition: Position.Left,
				data: { label: "cookbook" },
			},
		],
		edges: [
			{ id: "registry-cli", source: "registry", target: "cli", animated: true },
			{ id: "cli-site", source: "cli", target: "site" },
			{ id: "cli-cookbook", source: "cli", target: "cookbook" },
		],
		fitView: true,
	}));

	return (
		<div class="h-72 border border-border">
			<Flow flow={flow}>
				<Background />
				<Controls />
			</Flow>
		</div>
	);
}
