"use client";
import { isTouchDevice } from "@/lib/touch";
import {
	type SpringOptions,
	frame,
	motion,
	useMotionTemplate,
	useSpring,
} from "framer-motion";
import {
	type RefObject,
	createElement,
	useEffect,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";
import { twMerge } from "tailwind-merge";

const spring: SpringOptions = {
	bounce: 0,
	stiffness: 50,
	restDelta: 0.001,
};
export type SpotlightProps = {
	className?: string;
	spring?: SpringOptions;
};

export type ToggleProps = {
	toggle(fn: (prev: boolean) => boolean): void;
	enabled: boolean;
};
export function DefaultToggle(props: ToggleProps) {
	return (
		typeof document !== "undefined" &&
		createPortal(
			<button
				className="fixed top-0 left-0 text-"
				onClick={() => props.toggle((v) => !v)}
			>
				Spotlight {props.enabled ? "on" : "off"}
			</button>,
			document.body,
		)
	);
}

export default function Spotlight(
	props: SpotlightProps & {
		withToggle?: boolean | ((props: ToggleProps) => React.ReactNode);
	},
) {
	const [enabled, setEnabled] = useState(!isTouchDevice());
	return (
		isTouchDevice() || (
			<>
				{props.withToggle &&
					createElement<ToggleProps>(
						typeof props.withToggle === "function"
							? props.withToggle
							: DefaultToggle,
						{
							enabled: enabled,
							toggle: setEnabled,
						},
					)}
				{enabled && <MouseFollowingSpotlight {...props} />}
			</>
		)
	);
}
export function MouseFollowingSpotlight(props: SpotlightProps) {
	const ref = useRef<HTMLDivElement>(null);

	const [x, y] = useFollowPoiner(ref, props.spring ?? spring);

	return (
		<div
			ref={ref}
			className={twMerge("group overflow-hidden", props.className)}
		>
			<motion.div
				className="pointer-events-none absolute -inset-px transition"
				style={{
					background: useMotionTemplate`
            radial-gradient(
              650px circle at ${x}px ${y}px,
              rgba(45, 77, 166, 0.15),
              transparent 100%
            )
          `,
				}}
			/>
		</div>
	);
}

function useFollowPoiner(ref: RefObject<Element | null>, opt?: SpringOptions) {
	const x = useSpring(0, opt);
	const y = useSpring(0, opt);
	useEffect(() => {
		const handleMouseMove = ({ clientX, clientY }: MouseEvent) =>
			frame.read(() => {
				if (!ref.current) return;
				const { left, top } = ref.current.getBoundingClientRect();
				x.set(clientX - left);
				y.set(clientY - top);
			});
		if (window.innerWidth < 1000) return;
		window.addEventListener("mousemove", handleMouseMove);
		return () => window.removeEventListener("mousemove", handleMouseMove);
	}, [x, y, ref]);
	return [x, y];
}
