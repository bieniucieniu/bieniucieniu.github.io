import { type JSX, createContext, useContext } from "solid-js";
import type { Flow } from "@/lib/xyflow/createFlow";

export const FlowContext = createContext<Flow>();
export const NodeIdContext = createContext<string>();

export function useFlow(): Flow {
	const flow = useContext(FlowContext);
	if (!flow) throw new Error("useFlow must be used inside <Flow>.");
	return flow;
}

export function useNodeId(): string | undefined {
	return useContext(NodeIdContext);
}

export function FlowProvider(props: { flow: Flow; children: JSX.Element }) {
	return (
		<FlowContext.Provider value={props.flow}>
			{props.children}
		</FlowContext.Provider>
	);
}
