import { useFlow } from "../context";

export function Background() {
	const flow = useFlow();
	const gap = () => 20 * (flow.transform[2] || 1);
	const patternId = "xy-flow-background";

	return (
		<svg
			class="xy-flow__background"
			data-testid="rf__background"
			style={{
				position: "absolute",
				width: "100%",
				height: "100%",
				top: "0",
				left: "0",
			}}
		>
			<pattern
				id={patternId}
				x={flow.transform[0] % gap()}
				y={flow.transform[1] % gap()}
				width={gap()}
				height={gap()}
				patternUnits="userSpaceOnUse"
			>
				<circle
					cx="1"
					cy="1"
					r={flow.transform[2]}
					class="xy-flow__background-pattern dots"
				/>
			</pattern>
			<rect width="100%" height="100%" fill={`url(#${patternId})`} />
		</svg>
	);
}
