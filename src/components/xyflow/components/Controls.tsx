import { useFlow } from "../context";

export function Controls() {
	const flow = useFlow();

	return (
		<div
			class="xy-flow__panel bottom left xy-flow__controls"
			data-testid="rf__controls"
			role="group"
			aria-label="Flow controls"
		>
			<button
				type="button"
				class="xy-flow__controls-button xy-flow__controls-zoomin"
				aria-label="zoom in"
				disabled={flow.transform[2] >= flow.maxZoom}
				onClick={() => void flow.zoomIn()}
			>
				<PlusIcon />
			</button>
			<button
				type="button"
				class="xy-flow__controls-button xy-flow__controls-zoomout"
				aria-label="zoom out"
				disabled={flow.transform[2] <= flow.minZoom}
				onClick={() => void flow.zoomOut()}
			>
				<MinusIcon />
			</button>
			<button
				type="button"
				class="xy-flow__controls-button xy-flow__controls-fitview"
				aria-label="fit view"
				onClick={() => void flow.fitView()}
			>
				<FitIcon />
			</button>
		</div>
	);
}

function PlusIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path d="M14 14V8h4v6h6v4h-6v6h-4v-6H8v-4z" />
		</svg>
	);
}

function MinusIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path d="M8 14h16v4H8z" />
		</svg>
	);
}

function FitIcon() {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
			<path d="M4 12V4h8v4h4V4h8v8h-4v4h4v8h-8v-4h-4v4H4v-8h4v-4zm4-4H8v4h4V8zm12 0h-4v4h4V8zM8 20v4h4v-4zm16 4v-4h-4v4z" />
		</svg>
	);
}
