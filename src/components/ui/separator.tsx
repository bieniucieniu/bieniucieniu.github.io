import { Separator as SeparatorPrimitive } from "@kobalte/core/separator";
import { type ComponentProps, splitProps } from "solid-js";
import { cn } from "@/lib/utils";

type SeparatorProps = ComponentProps<typeof SeparatorPrimitive>;

export function Separator(props: SeparatorProps) {
	const [, rest] = splitProps(props, ["class", "ref"]);
	return (
		<SeparatorPrimitive
			ref={props.ref}
			class={cn(
				"shrink-0 border-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px data-[orientation=vertical]:self-stretch",
				props.class,
			)}
			{...rest}
		/>
	);
}
