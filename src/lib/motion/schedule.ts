const queue: Array<() => void> = [];
let scheduled = false;

/**
 * Run one commit's animations after every node has its new props.
 * Children register after parents, and the batch runs in reverse so
 * children animate first.
 */
export function scheduleMotion(run: () => void) {
	queue.push(run);
	if (scheduled) return;
	scheduled = true;
	queueMicrotask(() => {
		scheduled = false;
		const batch = queue.splice(0, queue.length);
		for (let index = batch.length - 1; index >= 0; index--) {
			batch[index]?.();
		}
	});
}
