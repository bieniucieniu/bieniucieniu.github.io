import type { AnimationOptions, MotionValue } from "motion";
import type { JSX } from "solid-js";

export type Transition = AnimationOptions;

/** A variant label, or several played in order. */
export type VariantLabels = string | string[];

export type Animatable = string | number | Array<string | number>;

export type Target = Record<string, Animatable | undefined>;

export type TargetAndTransition = Target & {
	transition?: Transition;
};

export type Variant =
	| TargetAndTransition
	| ((custom: unknown) => TargetAndTransition);

export type TargetResolver =
	| boolean
	| TargetAndTransition
	| VariantLabels
	| Variant;

export type Variants = Record<string, Variant>;

export type ReducedMotion = "user" | "always" | "never";

export type DragAxis = boolean | "x" | "y";

export interface DragConstraints {
	top?: number;
	left?: number;
	right?: number;
	bottom?: number;
}

export interface ViewportOptions {
	once?: boolean;
	margin?:
		| `${number}px`
		| `${number}%`
		| `${number}px ${number}px`
		| `${number}% ${number}%`;
	amount?: "some" | "all" | number;
}

export type GestureInfo = {
	point: { x: number; y: number };
};

export type MotionStyleKey =
	| "x"
	| "y"
	| "z"
	| "scale"
	| "scaleX"
	| "scaleY"
	| "rotate"
	| "rotateX"
	| "rotateY"
	| "rotateZ"
	| "skewX"
	| "skewY";

export type MotionStyleValue =
	| string
	| number
	| MotionValue<number>
	| MotionValue<string>;

export type MotionStyle = Omit<JSX.CSSProperties, MotionStyleKey> &
	Partial<Record<MotionStyleKey, MotionStyleValue>>;

export interface AnimationControls {
	start: (definition: TargetResolver, transition?: Transition) => Promise<void>;
	set: (definition: TargetResolver) => void;
	stop: () => void;
	subscribe: (runner: AnimationRunner) => () => void;
}

export interface AnimationRunner {
	start: (definition: TargetResolver, transition?: Transition) => Promise<void>;
	set: (definition: TargetResolver) => void;
	stop: () => void;
}

export interface DragControls {
	start: (event: PointerEvent) => void;
}

export interface MotionProps {
	initial?: TargetResolver;
	animate?: TargetResolver | AnimationControls;
	exit?: TargetResolver;
	variants?: Variants;
	transition?: Transition;
	inherit?: boolean;
	custom?: unknown;
	whileHover?: TargetResolver;
	whileTap?: TargetResolver;
	whileFocus?: TargetResolver;
	whileInView?: TargetResolver;
	whileDrag?: TargetResolver;
	drag?: DragAxis;
	dragConstraints?: DragConstraints | Element;
	dragElastic?: number | boolean;
	dragMomentum?: boolean;
	dragSnapToOrigin?: boolean | "x" | "y";
	dragDirectionLock?: boolean;
	dragPropagation?: boolean;
	dragControls?: DragControls;
	dragListener?: boolean;
	viewport?: ViewportOptions;
	onHoverStart?: (event: PointerEvent) => void;
	onHoverEnd?: (event: PointerEvent) => void;
	onTap?: (event: PointerEvent) => void;
	onTapStart?: (event: PointerEvent) => void;
	onTapCancel?: (event: PointerEvent) => void;
	onDragStart?: (event: PointerEvent, info: GestureInfo) => void;
	onDrag?: (event: PointerEvent, info: GestureInfo) => void;
	onDragEnd?: (event: PointerEvent, info: GestureInfo) => void;
	onViewportEnter?: () => void;
	onViewportLeave?: () => void;
	onUpdate?: (latest: unknown) => void;
	style?: MotionStyle;
}

export type MotionComponentProps = MotionProps &
	Omit<
		JSX.HTMLAttributes<HTMLElement>,
		"style" | "children" | "onDrag" | "onDragStart" | "onDragEnd"
	> & {
		ref?: (el: Element) => void;
		children?: JSX.Element;
		style?: MotionStyle;
		d?: string;
		cx?: string | number;
		cy?: string | number;
		r?: string | number;
		x1?: string | number;
		x2?: string | number;
		y1?: string | number;
		y2?: string | number;
		viewBox?: string;
		fill?: string;
		stroke?: string;
		xmlns?: string;
		points?: string;
	};

export const motionPropKeys = [
	"initial",
	"animate",
	"exit",
	"variants",
	"transition",
	"inherit",
	"custom",
	"whileHover",
	"whileTap",
	"whileFocus",
	"whileInView",
	"whileDrag",
	"drag",
	"dragConstraints",
	"dragElastic",
	"dragMomentum",
	"dragSnapToOrigin",
	"dragDirectionLock",
	"dragPropagation",
	"dragControls",
	"dragListener",
	"viewport",
	"onHoverStart",
	"onHoverEnd",
	"onTap",
	"onTapStart",
	"onTapCancel",
	"onDragStart",
	"onDrag",
	"onDragEnd",
	"onViewportEnter",
	"onViewportLeave",
	"onUpdate",
	"style",
	"ref",
	"children",
] as const;

export type MotionPropKey = (typeof motionPropKeys)[number];
