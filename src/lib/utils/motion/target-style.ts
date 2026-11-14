import type { JSX } from "solid-js";
import type { Target } from "@/lib/motion/types";

type TransformKey =
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

const transformOrder: TransformKey[] = [
	"x",
	"y",
	"z",
	"scale",
	"scaleX",
	"scaleY",
	"rotate",
	"rotateX",
	"rotateY",
	"rotateZ",
	"skewX",
	"skewY",
];

function px(value: string | number): string {
	return typeof value === "number" ? `${value}px` : value;
}

function deg(value: string | number): string {
	return typeof value === "number" ? `${value}deg` : value;
}

function scalar(value: string | number): string {
	return String(value);
}

const transformFns: Record<TransformKey, (value: string | number) => string> = {
	x: (value) => `translateX(${px(value)})`,
	y: (value) => `translateY(${px(value)})`,
	z: (value) => `translateZ(${px(value)})`,
	scale: (value) => `scale(${scalar(value)})`,
	scaleX: (value) => `scaleX(${scalar(value)})`,
	scaleY: (value) => `scaleY(${scalar(value)})`,
	rotate: (value) => `rotate(${deg(value)})`,
	rotateX: (value) => `rotateX(${deg(value)})`,
	rotateY: (value) => `rotateY(${deg(value)})`,
	rotateZ: (value) => `rotateZ(${deg(value)})`,
	skewX: (value) => `skewX(${deg(value)})`,
	skewY: (value) => `skewY(${deg(value)})`,
};

export function isTransformKey(key: string): key is TransformKey {
	return key in transformFns;
}

/** Static pose for the first paint. Motion's `animate()` owns later frames. */
export function targetToStyle(target: Target): JSX.CSSProperties {
	const style: Record<string, string | number> = {};
	const transform: string[] = [];
	for (const key of transformOrder) {
		const value = target[key];
		if (typeof value === "number" || typeof value === "string") {
			transform.push(transformFns[key](value));
		}
	}
	for (const key in target) {
		if (isTransformKey(key)) continue;
		const value = target[key];
		if (typeof value === "number" || typeof value === "string")
			style[key] = value;
	}
	if (transform.length > 0) style.transform = transform.join(" ");
	return style;
}

export function pinPopLayout(
	element: HTMLElement,
	anchorX: "left" | "right",
	anchorY: "top" | "bottom",
): () => void {
	const parent =
		element.offsetParent instanceof HTMLElement
			? element.offsetParent
			: element.parentElement;
	const top = element.offsetTop;
	const left = element.offsetLeft;
	const width = element.offsetWidth;
	const height = element.offsetHeight;
	const previous = {
		position: element.style.position,
		width: element.style.width,
		height: element.style.height,
		top: element.style.top,
		left: element.style.left,
		right: element.style.right,
		bottom: element.style.bottom,
	};
	element.style.position = "absolute";
	element.style.width = `${width}px`;
	element.style.height = `${height}px`;
	if (anchorX === "left") element.style.left = `${left}px`;
	else
		element.style.right = `${(parent?.clientWidth ?? width) - width - left}px`;
	if (anchorY === "top") element.style.top = `${top}px`;
	else
		element.style.bottom = `${(parent?.clientHeight ?? height) - height - top}px`;
	return () => {
		element.style.position = previous.position;
		element.style.width = previous.width;
		element.style.height = previous.height;
		element.style.top = previous.top;
		element.style.left = previous.left;
		element.style.right = previous.right;
		element.style.bottom = previous.bottom;
	};
}
