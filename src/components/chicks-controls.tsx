import { Bird, Egg } from "lucide-solid";
import { Show } from "solid-js";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { chicks, chicksOn, respawnChicks, setChicksOn } from "@/lib/chicks";
import { invertControl } from "@/lib/utils";

/**
 * Top-right controls: an on/off toggle for the chicks (off removes them all,
 * on brings a fresh flock; remembered across visits) and, while they are on,
 * a button to respawn them.
 */
export function ChicksControls() {
	return (
		<Show when={chicks()}>
			{/* data-chicks-controls: presses here drop no seed (lib/chicks.ts). */}
			<div data-chicks-controls class="fixed top-3 right-3 z-10 flex gap-1">
				<Show when={chicksOn()}>
					<Button
						variant="outline"
						size="icon"
						class={invertControl}
						aria-label="Respawn chicks"
						title="Respawn chicks"
						onClick={respawnChicks}
					>
						<Egg />
					</Button>
				</Show>
				<Toggle
					variant="outline"
					class={invertControl}
					aria-label="Chicks"
					title={chicksOn() ? "Remove all chicks" : "Bring the chicks back"}
					pressed={chicksOn()}
					onChange={setChicksOn}
				>
					<Bird />
				</Toggle>
			</div>
		</Show>
	);
}
