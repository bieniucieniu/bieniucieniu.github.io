import {
	attachSpring,
	cancelFrame,
	frame,
	inView,
	isMotionValue,
	motionValue,
	scrollInfo,
	transformValue,
	animate as animateTarget,
	type MotionValue,
	type SpringOptions,
} from "motion";
import {
	type Accessor,
	createEffect,
	createSignal,
	onCleanup,
	untrack,
} from "solid-js";
import { startDragControls } from "./state";
import type {
	AnimationControls,
	AnimationRunner,
	DragControls,
	Target,
	TargetResolver,
	Transition,
} from "./types";

type FrameData = { timestamp: number; delta: number };
type ScrollOptions = {
	container?: Element;
	target?: Element;
	offset?: Parameters<typeof scrollInfo>[1] extends infer Options
		? Options extends { offset?: infer Offset }
			? Offset
			: never
		: never;
};

function read<T>(source: T | Accessor<T>): T {
	return typeof source === "function" ? (source as Accessor<T>)() : source;
}

export function useMotionValue<T>(initial: T): MotionValue<T> {
	const value = motionValue(initial);
	onCleanup(() => value.destroy());
	return value;
}

export function useSpring<T extends number | string>(
	source: T | MotionValue<T> | Accessor<T | MotionValue<T>>,
	options?: SpringOptions | Accessor<SpringOptions | undefined>,
): MotionValue<T> {
	const initial = untrack(() => read(source));
	const value = motionValue(isMotionValue(initial) ? initial.get() : initial);
	createEffect(() => {
		const stop = attachSpring(value, read(source), read(options ?? {}));
		onCleanup(stop);
	});
	onCleanup(() => value.destroy());
	return value;
}

export function useTransform<I, O>(
	value: MotionValue<I>,
	transformer: (input: I) => O,
): MotionValue<O> {
	const derived = transformValue(() => transformer(value.get()));
	onCleanup(() => derived.destroy());
	return derived;
}

export function useMotionTemplate(
	strings: TemplateStringsArray,
	...values: Array<MotionValue | string | number>
): MotionValue<string> {
	const value = transformValue(() => {
		let rendered = strings[0] ?? "";
		for (let index = 0; index < values.length; index++) {
			const piece = values[index];
			const text = isMotionValue(piece)
				? String(piece.get())
				: String(piece ?? "");
			rendered += text + (strings[index + 1] ?? "");
		}
		return rendered;
	});
	onCleanup(() => value.destroy());
	return value;
}

export function useVelocity(value: MotionValue<number>): MotionValue<number> {
	const velocity = motionValue(value.getVelocity());
	createEffect(() => {
		const stop = value.on("change", () => {
			velocity.set(value.getVelocity());
		});
		onCleanup(stop);
	});
	onCleanup(() => velocity.destroy());
	return velocity;
}

export function useTime(): MotionValue<number> {
	const time = motionValue(0);
	const step = ({ timestamp }: FrameData) => {
		time.set(timestamp);
	};
	frame.update(step, true);
	onCleanup(() => {
		cancelFrame(step);
		time.destroy();
	});
	return time;
}

export function useAnimationFrame(
	callback: (timestamp: number, delta: number) => void,
) {
	createEffect(() => {
		const step = ({ timestamp, delta }: FrameData) => {
			callback(timestamp, delta);
		};
		frame.update(step, true);
		onCleanup(() => cancelFrame(step));
	});
}

export function useMotionValueEvent<T>(
	value: MotionValue<T>,
	event: "change",
	callback: (latest: T) => void,
) {
	createEffect(() => {
		const stop = value.on(event, callback);
		onCleanup(stop);
	});
}

type ViewOptions = {
	root?: Element | Document;
	margin?: `${number}${"px" | "%"}`;
	amount?: "some" | "all" | number;
	once?: boolean;
};

export function useInView(
	target: Accessor<Element | undefined>,
	options?: ViewOptions | Accessor<ViewOptions | undefined>,
): Accessor<boolean> {
	const [visible, setVisible] = createSignal(false);
	createEffect(() => {
		const element = target();
		if (!element) return;
		const opts = options === undefined ? undefined : read(options);
		const stop = inView(
			element,
			() => {
				setVisible(true);
				if (opts?.once) return;
				return () => setVisible(false);
			},
			opts,
		);
		onCleanup(() => {
			stop();
			setVisible(false);
		});
	});
	return visible;
}

export function useReducedMotion(): Accessor<boolean> {
	const [reduced, setReduced] = createSignal(false);
	createEffect(() => {
		if (
			typeof window === "undefined" ||
			typeof window.matchMedia !== "function"
		)
			return;
		const query = window.matchMedia("(prefers-reduced-motion: reduce)");
		const update = () => setReduced(query.matches);
		update();
		query.addEventListener("change", update);
		onCleanup(() => query.removeEventListener("change", update));
	});
	return reduced;
}

export function useScroll(
	options?: ScrollOptions | Accessor<ScrollOptions | undefined>,
) {
	const scrollX = motionValue(0);
	const scrollY = motionValue(0);
	const scrollXProgress = motionValue(0);
	const scrollYProgress = motionValue(0);
	createEffect(() => {
		const opts = options === undefined ? {} : (read(options) ?? {});
		const stop = scrollInfo(
			(info) => {
				scrollX.set(info.x.current);
				scrollY.set(info.y.current);
				scrollXProgress.set(info.x.progress);
				scrollYProgress.set(info.y.progress);
			},
			{
				container: opts.container,
				target: opts.target,
				offset: opts.offset,
			},
		);
		onCleanup(stop);
	});
	onCleanup(() => {
		scrollX.destroy();
		scrollY.destroy();
		scrollXProgress.destroy();
		scrollYProgress.destroy();
	});
	return { scrollX, scrollY, scrollXProgress, scrollYProgress };
}

export function useAnimate() {
	let scope: Element | undefined;
	const ref = (element: Element | null) => {
		scope = element ?? undefined;
	};
	function isTarget(value: Target | Transition | undefined): value is Target {
		return (
			!!value &&
			typeof value === "object" &&
			!("duration" in value) &&
			!("type" in value) &&
			!("stiffness" in value)
		);
	}

	function animateScope(
		target: Target,
		options?: Transition,
	): ReturnType<typeof animateTarget>;
	function animateScope(
		selector: string,
		target: Target,
		options?: Transition,
	): ReturnType<typeof animateTarget>;
	function animateScope(
		element: Element,
		target: Target,
		options?: Transition,
	): ReturnType<typeof animateTarget>;
	function animateScope(
		targetOrSelector: Target | string | Element,
		targetOrOptions?: Target | Transition,
		options?: Transition,
	) {
		if (
			typeof targetOrSelector === "string" ||
			targetOrSelector instanceof Element
		) {
			const subject =
				typeof targetOrSelector === "string"
					? (scope?.querySelector(targetOrSelector) ?? targetOrSelector)
					: targetOrSelector;
			if (!isTarget(targetOrOptions)) return;
			return animateTarget(subject, targetOrOptions, options);
		}
		const node = scope;
		if (!node) return;
		const transition = isTarget(targetOrOptions) ? undefined : targetOrOptions;
		return animateTarget(node, targetOrSelector, transition);
	}
	return [ref, animateScope] as const;
}

export function useAnimation(): AnimationControls {
	const runners = new Set<AnimationRunner>();
	const controls: AnimationControls = {
		start(definition: TargetResolver, transition?: Transition) {
			return Promise.all(
				[...runners].map((runner) => runner.start(definition, transition)),
			).then(() => undefined);
		},
		set(definition: TargetResolver) {
			for (const runner of runners) runner.set(definition);
		},
		stop() {
			for (const runner of runners) runner.stop();
		},
		subscribe(runner: AnimationRunner) {
			runners.add(runner);
			return () => runners.delete(runner);
		},
	};
	onCleanup(() => {
		runners.clear();
	});
	return controls;
}

export function useDragControls(): DragControls {
	const controls: DragControls = {
		start(event: PointerEvent) {
			startDragControls(controls, event);
		},
	};
	return controls;
}
