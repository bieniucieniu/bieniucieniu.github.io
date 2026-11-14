import { isMotionValue } from "motion";
import type { MotionValue } from "motion";
import type { MotionStyle } from "@/lib/motion/types";
import type {
	Animatable,
	Target,
	TargetAndTransition,
	TargetResolver,
	Transition,
	VariantLabels,
	Variants,
} from "@/lib/motion/types";

export function isLabel(value: unknown): value is VariantLabels {
	if (typeof value === "string") return true;
	return (
		Array.isArray(value) && value.every((item) => typeof item === "string")
	);
}

export function isAnimatable(value: unknown): value is Animatable {
	if (typeof value === "number" || typeof value === "string") return true;
	if (isMotionValue(value)) return false;
	return (
		Array.isArray(value) &&
		value.every((item) => typeof item === "number" || typeof item === "string")
	);
}

export function labelsOf(value: VariantLabels): string[] {
	return typeof value === "string" ? [value] : value;
}

export function resolveVariant(
	definition: TargetResolver | undefined,
	variants: Variants | undefined,
	custom: unknown,
): TargetAndTransition | undefined {
	if (
		definition == null ||
		definition === false ||
		typeof definition === "boolean"
	)
		return undefined;
	if (isLabel(definition)) {
		const label =
			typeof definition === "string"
				? definition
				: definition[definition.length - 1];
		return resolveVariant(variants?.[label], variants, custom);
	}
	if (typeof definition === "function") return definition(custom);
	return definition;
}

export function stripTarget(
	definition: TargetAndTransition | undefined,
): Target {
	const target: Target = {};
	if (!definition) return target;
	for (const key in definition) {
		if (key === "transition") continue;
		const value = definition[key];
		if (isAnimatable(value)) target[key] = value;
	}
	return target;
}

/** First keyframe, for the pre-animation pose. */
export function instantTarget(target: Target): Target {
	const next: Target = {};
	for (const key in target) {
		const value = target[key];
		if (Array.isArray(value)) {
			const first = value[0];
			if (first !== undefined) next[key] = first;
		} else if (value !== undefined) {
			next[key] = value;
		}
	}
	return next;
}

export function omitKeys(target: Target, keys: Iterable<string>): Target {
	const next: Target = { ...target };
	for (const key of keys) delete next[key];
	return next;
}

export function transitionFor(
	base: Transition | undefined,
	variant: TargetAndTransition | undefined,
	onUpdate: ((latest: unknown) => void) | undefined,
	reduced: boolean,
): Transition {
	const merged: Transition = { ...base, ...variant?.transition };
	if (onUpdate) merged.onUpdate = onUpdate;
	if (reduced) merged.duration = 0;
	return merged;
}

export function styleMotionValues(
	style: MotionStyle | undefined,
): Record<string, MotionValue> {
	const values: Record<string, MotionValue> = {};
	if (!style) return values;
	for (const [key, value] of Object.entries(style)) {
		if (isMotionValue(value)) values[key] = value;
	}
	return values;
}

export function sameMotionValues(
	left: Record<string, MotionValue> | undefined,
	right: Record<string, MotionValue>,
): boolean {
	const a = left ?? {};
	const aKeys = Object.keys(a);
	const bKeys = Object.keys(right);
	if (aKeys.length !== bKeys.length) return false;
	return bKeys.every((key) => a[key] === right[key]);
}

export function prefersReducedMotion(): boolean {
	return (
		typeof window !== "undefined" &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches
	);
}
