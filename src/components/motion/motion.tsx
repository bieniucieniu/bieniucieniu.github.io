import { isMotionValue } from "motion";
import {
	type Component,
	createEffect,
	on,
	onCleanup,
	splitProps,
	untrack,
	useContext,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
	MotionConfigContext,
	VariantContext,
	type VariantContextValue,
} from "./context";
import { PresenceContext } from "./presence";
import {
	instantTarget,
	isLabel,
	omitKeys,
	resolveVariant,
	stripTarget,
	styleMotionValues,
} from "@/lib/utils/motion/resolve";
import { scheduleMotion } from "@/lib/motion/schedule";
import { MotionState, type MotionSnapshot } from "@/lib/motion/state";
import {
	isTransformKey,
	pinPopLayout,
	targetToStyle,
} from "@/lib/utils/motion/target-style";
import {
	motionPropKeys,
	type AnimationControls,
	type MotionComponentProps,
	type MotionStyle,
} from "@/lib/motion/types";

const components = new Map<string, Component<MotionComponentProps>>();

function isControls(value: unknown): value is AnimationControls {
	if (!value || typeof value !== "object") return false;
	return "subscribe" in value && "start" in value && "stop" in value;
}

function staticStyle(
	style: MotionStyle | undefined,
): Record<string, string | number> {
	const css: Record<string, string | number> = {};
	if (!style) return css;
	for (const [key, value] of Object.entries(style)) {
		if (typeof value === "number" || typeof value === "string")
			css[key] = value;
	}
	return css;
}

function createMotionComponent(tag: string): Component<MotionComponentProps> {
	return (props) => {
		const [local, rest] = splitProps(props, motionPropKeys);
		const config = useContext(MotionConfigContext);
		const presence = useContext(PresenceContext);
		const parent = useContext(VariantContext);
		const state = new MotionState();
		let element: Element | undefined;
		let leaving = false;
		let pinned: (() => void) | undefined;

		const variants: VariantContextValue = {
			get initial() {
				if (isLabel(local.initial) || local.initial === false)
					return local.initial;
				return parent?.initial;
			},
			get animate() {
				if (isLabel(local.animate)) return local.animate;
				return parent?.animate;
			},
		};

		const initialStyle = untrack(() => {
			const block = presence?.blockInitial() ?? false;
			const jump = block || local.initial === false;
			const definition = jump
				? isControls(local.animate)
					? parent?.animate
					: (local.animate ?? parent?.animate)
				: local.initial !== undefined
					? local.initial
					: local.inherit === false
						? undefined
						: parent?.initial;
			const resolved =
				definition === undefined ||
				definition === false ||
				isControls(definition)
					? undefined
					: resolveVariant(definition, local.variants, local.custom);
			const pose = omitKeys(
				instantTarget(stripTarget(resolved)),
				Object.keys(styleMotionValues(local.style)),
			);
			return { ...targetToStyle(pose), ...staticStyle(local.style) };
		});

		function capture(): MotionSnapshot {
			return {
				initial: local.initial,
				animate: local.animate,
				exit: local.exit,
				variants: local.variants,
				transition: local.transition ?? config?.transition,
				custom: presence?.hasCustom ? presence.custom() : local.custom,
				inherit: local.inherit !== false,
				parentInitial: parent?.initial,
				parentAnimate: parent?.animate,
				blockInitial: presence?.blockInitial() ?? false,
				reducedMotion: config?.reducedMotion,
				whileHover: local.whileHover,
				whileTap: local.whileTap,
				whileFocus: local.whileFocus,
				whileInView: local.whileInView,
				whileDrag: local.whileDrag,
				drag: local.drag,
				dragConstraints: local.dragConstraints,
				dragElastic: local.dragElastic,
				dragMomentum: local.dragMomentum,
				dragSnapToOrigin: local.dragSnapToOrigin,
				dragDirectionLock: local.dragDirectionLock,
				dragPropagation: local.dragPropagation,
				dragControls: local.dragControls,
				viewport: local.viewport,
				onHoverStart: local.onHoverStart,
				onHoverEnd: local.onHoverEnd,
				onTap: local.onTap,
				onTapStart: local.onTapStart,
				onTapCancel: local.onTapCancel,
				onDragStart: local.onDragStart,
				onDrag: local.onDrag,
				onDragEnd: local.onDragEnd,
				onViewportEnter: local.onViewportEnter,
				onViewportLeave: local.onViewportLeave,
				onUpdate: local.onUpdate,
				styleValues: styleMotionValues(local.style),
			};
		}

		function setRef(node: Element) {
			element = node;
			state.attach(node);
			const ref = local.ref;
			if (typeof ref === "function") ref(node);
		}

		createEffect(() => {
			const present = presence?.isPresent() ?? true;
			const snap = capture();
			if (!present) {
				if (leaving) return;
				leaving = true;
				state.prepare(snap);
				const node = element;
				pinned =
					presence?.popLayout() && node instanceof HTMLElement
						? pinPopLayout(node, presence.anchorX(), presence.anchorY())
						: undefined;
				const done = state.exit().finally(() => {
					if (leaving) return;
					pinned?.();
					pinned = undefined;
				});
				presence?.registerExit(done);
				return;
			}
			if (leaving) {
				leaving = false;
				pinned?.();
				pinned = undefined;
				state.cancelExit();
			}
			scheduleMotion(() => state.apply(snap));
		});

		// `initialStyle` covers the first paint. Later changes to plain (non-MotionValue) style
		// values are written here; transform keys stay with MotionState.
		createEffect(
			on(
				() => staticStyle(local.style),
				(next, prev) => {
					const node = element;
					if (
						!prev ||
						!(node instanceof HTMLElement || node instanceof SVGElement)
					)
						return;
					for (const key of Object.keys(prev)) {
						if (!(key in next) && !isTransformKey(key))
							node.style.removeProperty(key);
					}
					for (const [key, value] of Object.entries(next)) {
						if (isTransformKey(key) || prev[key] === value) continue;
						node.style.setProperty(key, String(value));
					}
				},
				{ defer: true },
			),
		);

		createEffect(() => {
			const child = local.children;
			const node = element;
			if (!node || !isMotionValue(child)) return;
			node.textContent = String(child.get());
			const stop = child.on("change", (latest) => {
				node.textContent = String(latest);
			});
			onCleanup(stop);
		});

		onCleanup(() => state.destroy());

		const rendered = () => {
			const child = local.children;
			if (isMotionValue(child)) return String(untrack(() => child.get()));
			return child;
		};

		return (
			<VariantContext.Provider value={variants}>
				<Dynamic component={tag} {...rest} ref={setRef} style={initialStyle}>
					{rendered()}
				</Dynamic>
			</VariantContext.Provider>
		);
	};
}

type MotionProxy = {
	[tag: string]: Component<MotionComponentProps>;
};

export const motion: MotionProxy = new Proxy({} as MotionProxy, {
	get(_target, key) {
		if (typeof key !== "string") return undefined;
		const cached = components.get(key);
		if (cached) return cached;
		const created = createMotionComponent(key);
		components.set(key, created);
		return created;
	},
});
