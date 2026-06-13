import { useNavigate, useLocation } from "@solidjs/router";
import { createMemo } from "solid-js";
import {
	scrollToHomeSection,
	scrollToHomeSectionWhenReady,
	type HomeSectionId,
} from "~/lib/home-section";
import { useScrollSpySection } from "~/lib/scroll-spy";

const linkClass =
	"group flex flex-row items-center py-2 data-[active=true]:[&_span:first-child]:bg-slate-100 data-[active=true]:[&_span:first-child]:w-14";

export default function SectionLink(props: { id: HomeSectionId; text: string }) {
	const navigate = useNavigate();
	const location = useLocation();
	const activeSection = useScrollSpySection();

	const href = createMemo(() =>
		location.pathname === "/" ? `#${props.id}` : `/#${props.id}`,
	);

	const isActive = createMemo(
		() => location.pathname === "/" && activeSection() === props.id,
	);

	const handleClick = (event: MouseEvent) => {
		if (
			event.button !== 0 ||
			event.metaKey ||
			event.ctrlKey ||
			event.shiftKey ||
			event.altKey
		) {
			return;
		}

		event.preventDefault();

		if (location.pathname === "/") {
			scrollToHomeSection(props.id);
			return;
		}

		navigate(`/#${props.id}`, { scroll: false });
		scrollToHomeSectionWhenReady(props.id);
	};

	return (
		<li>
			<a
				href={href()}
				onClick={handleClick}
				class={linkClass}
				data-active={isActive()}
			>
				<span class="inline-block h-px w-9 bg-slate-600 mr-4 transition-all group-hover:bg-slate-400 group-hover:w-14" />
				<span class="text-slate-500 font-black transition-all text-md group-hover:text-slate-300 uppercase">
					{props.text}
				</span>
			</a>
		</li>
	);
}
