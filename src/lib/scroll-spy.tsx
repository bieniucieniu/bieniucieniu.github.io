import { useLocation } from "@solidjs/router";
import {
	createContext,
	createEffect,
	createSignal,
	onCleanup,
	type Accessor,
	type ParentComponent,
	useContext,
} from "solid-js";
import {
	HOME_SECTIONS,
	parseHomeSectionHash,
	scrollToHomeSectionWhenReady,
	type HomeSectionId,
} from "~/lib/home-section";

export { HOME_SECTIONS, type HomeSectionId } from "~/lib/home-section";

const ScrollSpyContext = createContext<Accessor<HomeSectionId | null>>();

export function useScrollSpySection() {
	return useContext(ScrollSpyContext) ?? (() => null);
}

export const ScrollSpyProvider: ParentComponent = (props) => {
	const location = useLocation();
	const [activeId, setActiveId] = createSignal<HomeSectionId | null>(null);

	createEffect(() => {
		const pathname = location.pathname;
		const hash = location.hash;
		let observer: IntersectionObserver | undefined;
		const visibility = new Map<string, number>();

		const pickActive = () => {
			const visible = HOME_SECTIONS.flatMap((id) => {
				const el = document.getElementById(id);
				if (!el || (visibility.get(id) ?? 0) <= 0) return [];
				return [{ id, top: el.getBoundingClientRect().top }];
			}).sort((a, b) => a.top - b.top);

			if (visible.length > 0) {
				setActiveId(visible[0].id);
			}
		};

		const syncFromHash = () => {
			const section = parseHomeSectionHash(hash);
			if (!section) return;
			setActiveId(section);
			scrollToHomeSectionWhenReady(section);
		};

		const disconnect = () => {
			observer?.disconnect();
			observer = undefined;
		};

		const connect = () => {
			disconnect();
			visibility.clear();

			if (pathname !== "/") {
				setActiveId(null);
				return;
			}

			syncFromHash();

			observer = new IntersectionObserver(
				(entries) => {
					for (const entry of entries) {
						visibility.set(entry.target.id, entry.intersectionRatio);
					}
					pickActive();
				},
				{
					rootMargin: "-10% 0px -55% 0px",
					threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
				},
			);

			for (const id of HOME_SECTIONS) {
				const el = document.getElementById(id);
				if (el) observer.observe(el);
			}
		};

		const onHashChange = () => syncFromHash();

		queueMicrotask(connect);
		window.addEventListener("hashchange", onHashChange);

		onCleanup(() => {
			disconnect();
			window.removeEventListener("hashchange", onHashChange);
		});
	});

	return (
		<ScrollSpyContext.Provider value={activeId}>
			{props.children}
		</ScrollSpyContext.Provider>
	);
};
