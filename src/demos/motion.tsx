import { createSignal } from "solid-js";
import { AnimatePresence, MotionConfig, motion } from "@/components/motion";
import { Button } from "@/components/ui/button";

type Item = { id: number; name: string };

export default function MotionDemo() {
	let next = 4;
	const [items, setItems] = createSignal<Item[]>([
		{ id: 1, name: "One" },
		{ id: 2, name: "Two" },
		{ id: 3, name: "Three" },
	]);

	return (
		<MotionConfig transition={{ duration: 0.3 }}>
			<div class="grid gap-6 border border-border p-4 sm:grid-cols-2">
				<div class="flex flex-col gap-3">
					<p class="text-xs text-muted-foreground">Drag and hover</p>
					<div class="h-12 w-full max-w-56 outline outline-foreground">
						<motion.div
							class="size-12 cursor-grab bg-primary active:cursor-grabbing"
							drag="x"
							dragConstraints={{ left: 0, right: 176 }}
							whileHover={{ scale: 1.1 }}
						/>
					</div>
				</div>
				<div class="flex flex-col gap-3">
					<p class="text-xs text-muted-foreground">Enter and exit</p>
					<div class="flex gap-2">
						<Button
							class="hover:bg-primary"
							onClick={() =>
								setItems((list) => [
									...list,
									{ id: next, name: `Item ${next++}` },
								])
							}
						>
							Add
						</Button>
						<Button
							variant="outline"
							class="hover:bg-foreground hover:text-background"
							onClick={() => setItems((list) => list.slice(0, -1))}
						>
							Remove
						</Button>
					</div>
					<div class="flex flex-col gap-1.5">
						<AnimatePresence each={items} by={(item) => item.id}>
							{(item) => (
								<motion.div
									class="border border-border px-3 py-1.5 text-sm"
									initial={{ opacity: 0, x: -12 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 12 }}
								>
									{item.name}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</MotionConfig>
	);
}
