import { animate, drag, hover, inView, press, styleEffect } from "motion";
import type { MotionValue } from "motion";
import {
	instantTarget,
	isLabel,
	omitKeys,
	prefersReducedMotion,
	resolveVariant,
	sameMotionValues,
	stripTarget,
	transitionFor,
} from "@/lib/utils/motion/resolve";
import type {
	AnimationControls,
	AnimationRunner,
	DragControls,
	ReducedMotion,
	Target,
	TargetResolver,
	Transition,
	VariantLabels,
	Variants,
	ViewportOptions,
} from "./types";

type Playback = {
	stop: () => void;
	finished?: Promise<unknown>;
	then?: (onFulfilled: () => void) => Promise<unknown>;
};

export interface MotionSnapshot {
	initial: TargetResolver | undefined;
	animate: TargetResolver | AnimationControls | undefined;
	exit: TargetResolver | undefined;
	variants: Variants | undefined;
	transition: Transition | undefined;
	custom: unknown;
	inherit: boolean;
	parentInitial: VariantLabels | false | undefined;
	parentAnimate: VariantLabels | undefined;
	blockInitial: boolean;
	reducedMotion: ReducedMotion | undefined;
	whileHover: TargetResolver | undefined;
	whileTap: TargetResolver | undefined;
	whileFocus: TargetResolver | undefined;
	whileInView: TargetResolver | undefined;
	whileDrag: TargetResolver | undefined;
	drag: boolean | "x" | "y" | undefined;
	dragConstraints: MotionSnapshotConstraints;
	dragElastic: number | boolean | undefined;
	dragMomentum: boolean | undefined;
	dragSnapToOrigin: boolean | "x" | "y" | undefined;
	dragDirectionLock: boolean | undefined;
	dragPropagation: boolean | undefined;
	dragControls: DragControls | undefined;
	viewport: ViewportOptions | undefined;
	onHoverStart: ((event: PointerEvent) => void) | undefined;
	onHoverEnd: ((event: PointerEvent) => void) | undefined;
	onTap: ((event: PointerEvent) => void) | undefined;
	onTapStart: ((event: PointerEvent) => void) | undefined;
	onTapCancel: ((event: PointerEvent) => void) | undefined;
	onDragStart:
		| ((event: PointerEvent, info: { point: { x: number; y: number } }) => void)
		| undefined;
	onDrag:
		| ((event: PointerEvent, info: { point: { x: number; y: number } }) => void)
		| undefined;
	onDragEnd:
		| ((event: PointerEvent, info: { point: { x: number; y: number } }) => void)
		| undefined;
	onViewportEnter: (() => void) | undefined;
	onViewportLeave: (() => void) | undefined;
	onUpdate: ((latest: unknown) => void) | undefined;
	styleValues: Record<string, MotionValue>;
}

type MotionSnapshotConstraints =
	| { top?: number; left?: number; right?: number; bottom?: number }
	| Element
	| undefined;

type GestureName =
	| "whileDrag"
	| "whileTap"
	| "whileHover"
	| "whileFocus"
	| "whileInView";

const gestureOrder: GestureName[] = [
	"whileDrag",
	"whileTap",
	"whileHover",
	"whileFocus",
	"whileInView",
];

const dragStarts = new WeakMap<DragControls, (event: PointerEvent) => void>();

export function bindDragControls(
	controls: DragControls,
	start: (event: PointerEvent) => void,
) {
	dragStarts.set(controls, start);
	return () => {
		if (dragStarts.get(controls) === start) dragStarts.delete(controls);
	};
}

export function startDragControls(controls: DragControls, event: PointerEvent) {
	dragStarts.get(controls)?.(event);
}

function isControls(value: unknown): value is AnimationControls {
	if (!value || typeof value !== "object") return false;
	return "subscribe" in value && "start" in value && "stop" in value;
}

function finished(playback: Playback): Promise<void> {
	return Promise.resolve(playback).then(() => undefined);
}

function reducedNow(config: ReducedMotion | undefined): boolean {
	if (config === "always") return true;
	if (config === "never") return false;
	return prefersReducedMotion();
}

/**
 * One DOM node. Props come in as plain snapshots. Animation, gestures, and
 * motion-value styles go through vanilla `animate`, `hover`, `press`,
 * `inView`, `drag`, and `styleEffect`.
 */
export class MotionState {
	private element: Element | undefined;
	private snap: MotionSnapshot | undefined;
	private current: Playback | undefined;
	private exiting = false;
	private entered = false;
	private lastPlay = "";
	private gestureKey = "";
	private constraints: MotionSnapshotConstraints;
	private styleValues: Record<string, MotionValue> | undefined;
	private styleStop: (() => void) | undefined;
	private gestureStop: Array<() => void> = [];
	private controls: AnimationControls | undefined;
	private unsubscribe: (() => void) | undefined;
	private unbindDrag: (() => void) | undefined;
	private flags: Record<GestureName, boolean> = {
		whileDrag: false,
		whileTap: false,
		whileHover: false,
		whileFocus: false,
		whileInView: false,
	};

	attach(element: Element) {
		this.element = element;
		if (this.snap) this.apply(this.snap);
	}

	prepare(snap: MotionSnapshot) {
		this.snap = snap;
	}

	apply(snap: MotionSnapshot) {
		this.snap = snap;
		if (!this.element) return;
		this.bindStyle(snap.styleValues);
		this.bindGestures(snap);
		this.bindControls(snap);
		if (this.exiting || isControls(snap.animate)) return;
		this.playBase();
	}

	exit(): Promise<void> {
		this.exiting = true;
		const snap = this.snap;
		const element = this.element;
		if (!snap || !element) return Promise.resolve();
		const definition = snap.exit;
		const target = this.targetFrom(definition, snap);
		if (Object.keys(target).length === 0) return Promise.resolve();
		const resolved = resolveVariant(definition, snap.variants, snap.custom);
		return this.start(
			target,
			transitionFor(
				snap.transition,
				resolved,
				snap.onUpdate,
				reducedNow(snap.reducedMotion),
			),
		);
	}

	cancelExit() {
		if (!this.exiting) return;
		this.exiting = false;
		this.lastPlay = "";
		this.current?.stop();
		this.playBase();
	}

	destroy() {
		for (const stop of this.gestureStop) stop();
		this.gestureStop = [];
		this.styleStop?.();
		this.unsubscribe?.();
		this.unbindDrag?.();
		if (!this.exiting) this.current?.stop();
		this.element = undefined;
	}

	private bindStyle(values: Record<string, MotionValue>) {
		if (!this.element || sameMotionValues(this.styleValues, values)) return;
		this.styleStop?.();
		this.styleValues = values;
		this.styleStop =
			Object.keys(values).length > 0
				? styleEffect(this.element, values)
				: undefined;
	}

	private bindControls(snap: MotionSnapshot) {
		const controls = isControls(snap.animate) ? snap.animate : undefined;
		if (controls === this.controls) return;
		this.unsubscribe?.();
		this.controls = controls;
		if (!controls) {
			this.unsubscribe = undefined;
			return;
		}
		const runner: AnimationRunner = {
			start: (definition, transition) => {
				this.lastPlay = "";
				return this.playDefinition(
					definition,
					transition ?? snap.transition,
					false,
				);
			},
			set: (definition) => {
				this.lastPlay = "";
				return this.playDefinition(definition, { duration: 0 }, true);
			},
			stop: () => this.current?.stop(),
		};
		this.unsubscribe = controls.subscribe(runner);
	}

	private bindGestures(snap: MotionSnapshot) {
		const element = this.element;
		if (!element) return;
		const key = [
			snap.whileHover ? "h" : "",
			snap.onHoverStart ? "hs" : "",
			snap.onHoverEnd ? "he" : "",
			snap.whileTap ? "t" : "",
			snap.onTap ? "ts" : "",
			snap.onTapStart ? "tp" : "",
			snap.whileFocus ? "f" : "",
			snap.whileInView ? "v" : "",
			snap.onViewportEnter ? "ve" : "",
			snap.onViewportLeave ? "vl" : "",
			snap.viewport?.once ? "o" : "",
			snap.viewport?.margin ?? "",
			String(snap.viewport?.amount ?? ""),
			String(snap.drag ?? ""),
			String(snap.dragMomentum ?? ""),
			String(snap.dragSnapToOrigin ?? ""),
			String(snap.dragDirectionLock ?? ""),
			String(snap.dragPropagation ?? ""),
			String(snap.dragElastic ?? ""),
		].join("|");
		if (
			key === this.gestureKey &&
			snap.dragConstraints === this.constraints &&
			snap.dragControls === this.boundDrag
		) {
			return;
		}
		this.gestureKey = key;
		this.constraints = snap.dragConstraints;
		this.boundDrag = snap.dragControls;
		for (const stop of this.gestureStop) stop();
		this.gestureStop = [];
		this.unbindDrag?.();
		this.unbindDrag = undefined;

		if (snap.whileHover || snap.onHoverStart || snap.onHoverEnd) {
			this.gestureStop.push(
				hover(element, (_node, event) => {
					this.flags.whileHover = true;
					this.snap?.onHoverStart?.(event);
					this.lastPlay = "";
					this.playBase();
					return (end) => {
						this.flags.whileHover = false;
						this.snap?.onHoverEnd?.(end);
						this.lastPlay = "";
						this.playBase();
					};
				}),
			);
		}

		if (snap.whileTap || snap.onTap || snap.onTapStart || snap.onTapCancel) {
			this.gestureStop.push(
				press(element, (_node, event) => {
					this.flags.whileTap = true;
					this.snap?.onTapStart?.(event);
					this.lastPlay = "";
					this.playBase();
					return (end, info) => {
						this.flags.whileTap = false;
						if (info.success) this.snap?.onTap?.(end);
						else this.snap?.onTapCancel?.(end);
						this.lastPlay = "";
						this.playBase();
					};
				}),
			);
		}

		if (snap.whileFocus) {
			const onFocus = () => {
				this.flags.whileFocus = true;
				this.lastPlay = "";
				this.playBase();
			};
			const onBlur = () => {
				this.flags.whileFocus = false;
				this.lastPlay = "";
				this.playBase();
			};
			element.addEventListener("focus", onFocus);
			element.addEventListener("blur", onBlur);
			this.gestureStop.push(() => {
				element.removeEventListener("focus", onFocus);
				element.removeEventListener("blur", onBlur);
			});
		}

		if (snap.whileInView || snap.onViewportEnter || snap.onViewportLeave) {
			this.gestureStop.push(
				inView(
					element,
					() => {
						this.flags.whileInView = true;
						this.snap?.onViewportEnter?.();
						this.lastPlay = "";
						this.playBase();
						if (snap.viewport?.once) return;
						return () => {
							this.flags.whileInView = false;
							this.snap?.onViewportLeave?.();
							this.lastPlay = "";
							this.playBase();
						};
					},
					{
						amount: snap.viewport?.amount,
						margin: snap.viewport?.margin,
					},
				),
			);
		}

		if (snap.drag) {
			const axis = snap.drag === true ? undefined : snap.drag;
			this.gestureStop.push(
				drag(element, {
					axis,
					constraints: snap.dragConstraints,
					elastic: snap.dragElastic,
					momentum: snap.dragMomentum,
					snapToOrigin: snap.dragSnapToOrigin,
					directionLock: snap.dragDirectionLock,
					propagation: snap.dragPropagation,
					onStart: (event, info) => {
						this.flags.whileDrag = true;
						if (event instanceof PointerEvent)
							this.snap?.onDragStart?.(event, { point: info.point });
						this.lastPlay = "";
						this.playBase();
					},
					onMove: (event, info) => {
						if (event instanceof PointerEvent)
							this.snap?.onDrag?.(event, { point: info.point });
					},
					onEnd: (event, info) => {
						this.flags.whileDrag = false;
						if (event instanceof PointerEvent)
							this.snap?.onDragEnd?.(event, { point: info.point });
						this.lastPlay = "";
						this.playBase();
					},
				}),
			);
			if (snap.dragControls) {
				this.unbindDrag = bindDragControls(snap.dragControls, (event) => {
					element.dispatchEvent(
						new PointerEvent("pointerdown", {
							bubbles: true,
							cancelable: true,
							clientX: event.clientX,
							clientY: event.clientY,
							pointerId: event.pointerId,
							pointerType: event.pointerType,
						}),
					);
				});
			}
		}
	}

	private boundDrag: DragControls | undefined;

	private playBase() {
		const snap = this.snap;
		if (!snap || !this.element || this.exiting) return;
		const active = this.activeDefinition(snap);
		if (active !== undefined) {
			void this.playDefinition(active, snap.transition, false);
			return;
		}
		const base = this.baseDefinition(snap);
		if (!this.entered) {
			this.entered = true;
			const jump = snap.blockInitial || snap.initial === false;
			if (jump) {
				void this.playDefinition(base, snap.transition, true);
				return;
			}
			const initial =
				snap.initial !== undefined
					? snap.initial
					: snap.inherit === false
						? undefined
						: snap.parentInitial;
			if (initial && !isControls(initial)) {
				const pose = this.targetFrom(initial, snap);
				if (Object.keys(pose).length > 0) {
					void this.start(instantTarget(pose), { duration: 0 }).then(() => {
						if (!this.element || this.exiting) return;
						void this.playDefinition(base, snap.transition, false);
					});
					return;
				}
			}
		}
		void this.playDefinition(base, snap.transition, false);
	}

	private baseDefinition(snap: MotionSnapshot): TargetResolver | undefined {
		if (snap.animate !== undefined && !isControls(snap.animate))
			return snap.animate;
		if (snap.inherit === false) return undefined;
		return snap.parentAnimate;
	}

	private activeDefinition(snap: MotionSnapshot): TargetResolver | undefined {
		for (const name of gestureOrder) {
			if (!this.flags[name]) continue;
			const definition = snap[name];
			if (definition !== undefined) return definition;
		}
		return undefined;
	}

	private playDefinition(
		definition: TargetResolver | undefined,
		transition: Transition | undefined,
		instant: boolean,
	): Promise<void> {
		const snap = this.snap;
		if (!snap) return Promise.resolve();
		if (
			!instant &&
			isLabel(definition) &&
			Array.isArray(definition) &&
			definition.length > 1
		) {
			return this.playLabels(definition, transition);
		}
		const resolved = resolveVariant(definition, snap.variants, snap.custom);
		const target = this.targetFrom(definition, snap);
		if (Object.keys(target).length === 0) return Promise.resolve();
		const options = transitionFor(
			transition,
			resolved,
			snap.onUpdate,
			reducedNow(snap.reducedMotion) || instant,
		);
		if (instant) {
			const pose = instantTarget(target);
			const key = JSON.stringify(pose);
			if (key === this.lastPlay) return Promise.resolve();
			this.lastPlay = key;
			return this.start(pose, { duration: 0 });
		}
		const key = JSON.stringify({ target, options });
		if (key === this.lastPlay) return Promise.resolve();
		this.lastPlay = key;
		return this.start(target, options);
	}

	private playLabels(
		labels: string[],
		transition: Transition | undefined,
	): Promise<void> {
		const element = this.element;
		let chain = Promise.resolve();
		for (const label of labels) {
			chain = chain.then(() => {
				if (this.element !== element || this.exiting) return undefined;
				this.lastPlay = "";
				return this.playDefinition(label, transition, false);
			});
		}
		return chain;
	}

	private targetFrom(
		definition: TargetResolver | undefined,
		snap: MotionSnapshot,
	): Target {
		const resolved = resolveVariant(definition, snap.variants, snap.custom);
		return omitKeys(stripTarget(resolved), Object.keys(snap.styleValues));
	}

	private start(target: Target, options: Transition): Promise<void> {
		const element = this.element;
		if (!element || Object.keys(target).length === 0) return Promise.resolve();
		const playback = animate(element, target, options);
		this.current = playback;
		return finished(playback);
	}
}
