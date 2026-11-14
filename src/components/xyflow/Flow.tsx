import {
	For,
	Show,
	type JSX,
	createEffect,
	createSignal,
	on,
	onCleanup,
	onMount,
} from "solid-js";
import { FlowProvider, useFlow } from "./context";
import type { Flow as FlowStore } from "@/lib/xyflow/createFlow";
import { ConnectionLine, EdgeView } from "./components/Edges";
import { NodeView } from "./components/NodeView";
import { Pane } from "./components/Pane";
import { cx } from "@/lib/utils/xyflow/cx";

export type FlowProps = {
	flow: FlowStore;
	children?: JSX.Element;
	class?: string;
	style?: JSX.CSSProperties;
};

const layerStyle: JSX.CSSProperties = {
	position: "absolute",
	width: "100%",
	height: "100%",
	top: 0,
	left: 0,
};

export function Flow(props: FlowProps) {
	return (
		<FlowProvider flow={props.flow}>
			<FlowSurface class={props.class} style={props.style}>
				{props.children}
			</FlowSurface>
		</FlowProvider>
	);
}

function FlowSurface(props: {
	class?: string;
	style?: JSX.CSSProperties;
	children?: JSX.Element;
}) {
	const flow = useFlow();
	let root: HTMLDivElement | undefined;
	let renderer: HTMLDivElement | undefined;
	const [ready, setReady] = createSignal(false);
	const resizeObserver = new ResizeObserver((entries) => {
		const updates = new Map();
		for (const entry of entries) {
			const id = entry.target.getAttribute("data-id");
			if (!id) continue;
			updates.set(id, {
				id,
				nodeElement: entry.target as HTMLDivElement,
				force: true,
			});
		}
		if (updates.size) flow.updateNodeInternals(updates);
	});

	onMount(() => {
		if (!root || !renderer) return;
		const stop = flow.attach(root, renderer);
		setReady(true);
		onCleanup(() => {
			stop();
			resizeObserver.disconnect();
		});
	});

	// `updateInteraction` reads the store untracked, so its inputs are tracked here.
	createEffect(
		on(
			[
				ready,
				() => flow.userSelectionActive,
				() => flow.connection.inProgress,
				() => flow.selectionKeyPressed,
				() => flow.selectionOnDrag,
			],
			([isReady]) => {
				if (isReady) flow.updateInteraction();
			},
		),
	);

	return (
		<div
			ref={(el) => {
				root = el;
			}}
			class={cx("xy-flow", props.class)}
			style={{
				width: "100%",
				height: "100%",
				position: "relative",
				overflow: "hidden",
				"z-index": 0,
				...props.style,
			}}
			data-testid="rf__wrapper"
			role="application"
		>
			<div
				ref={(el) => {
					renderer = el;
				}}
				class="xy-flow__renderer"
				style={layerStyle}
			>
				<Pane>
					<div
						class="xy-flow__viewport xyflow__viewport xy-flow__container"
						data-testid="rf__viewport"
						style={{
							transform: `translate(${flow.transform[0]}px, ${flow.transform[1]}px) scale(${flow.transform[2]})`,
						}}
					>
						<div class="xy-flow__edges" style={layerStyle}>
							<For each={flow.edges}>
								{(edge) => (
									<Show when={!edge.hidden}>
										<EdgeView edge={edge} />
									</Show>
								)}
							</For>
						</div>
						<div class="xy-flow__nodes" style={layerStyle}>
							<For each={flow.nodes}>
								{(node) => (
									<NodeView node={node} resizeObserver={resizeObserver} />
								)}
							</For>
						</div>
						<ConnectionLine />
					</div>
				</Pane>
			</div>
			{props.children}
		</div>
	);
}
