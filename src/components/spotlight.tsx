import {
	type Accessor,
	type Component,
	createComponent,
	createEffect,
	createSignal,
	onMount,
} from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { isTouchDevice } from "~/lib/touch";

export type ToggleProps = {
	toggle(fn: (prev: boolean) => boolean): void;
	enabled: boolean;
};
export type SpotlightProps = {
	className?: string;
	// spring?: SpringOptions;
};

export function DefaultToggle(props: ToggleProps) {
	return (
		<Portal mount={document.body}>
			<button
				type="button"
				class="fixed top-0 left-0 opacity-70"
				onClick={() => props.toggle((v) => !v)}
			>
				Spotlight {props.enabled ? "on" : "off"}
			</button>
		</Portal>
	);
}

export default function Spotlight(
	props: SpotlightProps & {
		withToggle?: boolean | Component<ToggleProps>;
	},
) {
	const [enabled, setEnabled] = createSignal(true);
	if (isTouchDevice()) return null;
	return (
		<>
			{isTouchDevice() ? null : (
				<>
					{props.withToggle &&
						createComponent<ToggleProps>(
							typeof props.withToggle === "function"
								? props.withToggle
								: DefaultToggle,
							{
								get enabled() {
									return enabled();
								},
								toggle: setEnabled,
							},
						)}
					{enabled() && <MouseFollowingSpotlight {...props} />}
				</>
			)}
		</>
	);
}

export function MouseFollowingSpotlight(props: SpotlightProps) {
	let ref: HTMLDivElement | null = null;

	const [x, y] = useFollowPoiner(() => ref);

	return (
		<div
			ref={(r) => (ref = r)}
			class={twMerge("group overflow-hidden", props.className)}
		>
			<div
				class="pointer-events-none absolute -inset-px transition"
				style={{
					background: `
            radial-gradient(
              650px circle at ${x()}px ${y()}px,
              rgba(45, 77, 166, 0.15),
              transparent 100%
            )
          `,
				}}
			/>
		</div>
	);
}

function useFollowPoiner(ref: Accessor<Element | null>, opt?: SpringOptions) {
	const [x, setX] = createSpringSignal(0, opt);
	const [y, setY] = createSpringSignal(0, opt);
	onMount(() => {
		const e = ref();
		if (!e) return;
		const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
			const { left, top } = e.getBoundingClientRect();
			setX(clientX - left);
			setY(clientY - top);
		};
		if (window.innerWidth < 1000) return;
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	});
	return [x, y];
}

interface SpringOptions {
	stiffness?: number;
}

interface SimpleSetter<T> {
	<U extends T>(value: (prev: T) => U): U;
	<U extends T>(value: Exclude<U, Function>): U;
	<U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U;
}
const frame = 1000 / 60;
function createSpringSignal(value: number, options?: SpringOptions) {
	const [spring, setSpring] = createSignal<number>(value);
	const [target, setTarget] = createSignal<number>(value);
	const setter: SimpleSetter<number> = () =>
		setSpring((prev: number) => {
			let t = target();
			const d = (t - prev) * (options?.stiffness ?? 0.01);
			t = prev + d;
			return t;
		});

	createEffect(() => {
		const handle = setInterval(() => {
			setSpring(setter);
		}, frame);
		return () => clearInterval(handle);
	});

	return [spring, setTarget] as const;
}
