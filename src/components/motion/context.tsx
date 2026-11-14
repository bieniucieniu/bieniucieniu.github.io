import { type JSX, createContext, useContext } from "solid-js";
import type {
	ReducedMotion,
	Transition,
	VariantLabels,
} from "@/lib/motion/types";

export interface MotionConfigValue {
	readonly transition: Transition | undefined;
	readonly reducedMotion: ReducedMotion | undefined;
}

export const MotionConfigContext = createContext<MotionConfigValue>();

export function MotionConfig(props: {
	transition?: Transition;
	reducedMotion?: ReducedMotion;
	children?: JSX.Element;
}) {
	const parent = useContext(MotionConfigContext);
	const value: MotionConfigValue = {
		get transition() {
			return props.transition ?? parent?.transition;
		},
		get reducedMotion() {
			return props.reducedMotion ?? parent?.reducedMotion;
		},
	};
	return (
		<MotionConfigContext.Provider value={value}>
			{props.children}
		</MotionConfigContext.Provider>
	);
}

export interface VariantContextValue {
	readonly initial: VariantLabels | false | undefined;
	readonly animate: VariantLabels | undefined;
}

export const VariantContext = createContext<VariantContextValue>();
