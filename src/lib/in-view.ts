import { type Accessor, createSignal, onCleanup, onMount } from "solid-js";

export function useListenInView(
	id: Accessor<HTMLElement | undefined | null>,
): Accessor<boolean> {
	const [inView, setInView] = createSignal(false);
	onMount(() => {
		const el = id();
		const observer = new IntersectionObserver(([entry]) => {
			setInView(entry.isIntersecting);
		});

		if (el) observer.observe(el);

		onCleanup(() => observer.disconnect());
	});
	return inView;
}
