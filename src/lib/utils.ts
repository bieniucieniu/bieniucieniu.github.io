import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/**
 * Black-and-white control states: invert on hover/pressed, dashed when
 * disabled. The hover background is `!` because the outline Button's
 * `dark:bg-input/30` has the same specificity and comes later; it is limited
 * to `enabled:` so a control disabled under the cursor doesn't stay inverted.
 */
export const invertControl =
	"border-border enabled:hover:bg-foreground! enabled:hover:text-background data-pressed:bg-foreground data-pressed:text-background disabled:border-dashed disabled:opacity-100";
