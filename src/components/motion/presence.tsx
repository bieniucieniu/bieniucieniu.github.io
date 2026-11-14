import {
	type Accessor,
	type JSX,
	Show,
	createContext,
	createEffect,
	createMemo,
	createRoot,
	createSignal,
	onCleanup,
	onMount,
	untrack,
	useContext,
} from "solid-js";
import { For } from "solid-js";

export interface PresenceState {
	isPresent: () => boolean;
	blockInitial: () => boolean;
	popLayout: () => boolean;
	anchorX: () => "left" | "right";
	anchorY: () => "top" | "bottom";
	hasCustom: boolean;
	custom: () => unknown;
	registerExit: (done: Promise<void>) => void;
}

export const PresenceContext = createContext<PresenceState>();

export function useIsPresent(): Accessor<boolean> {
	const presence = useContext(PresenceContext);
	return () => presence?.isPresent() ?? true;
}

export type PresenceMode = "sync" | "wait" | "popLayout";

export interface AnimatePresenceProps<T = unknown> {
	when?: boolean | Accessor<boolean>;
	each?: readonly T[] | Accessor<readonly T[]>;
	by?: (item: T) => string | number;
	mode?: PresenceMode;
	initial?: boolean;
	custom?: unknown;
	anchorX?: "left" | "right";
	anchorY?: "top" | "bottom";
	onExitComplete?: () => void;
	children?: JSX.Element | ((item: T, index: Accessor<number>) => JSX.Element);
}

interface Row<T> {
	key: string;
	item: T;
	index: number;
	present: Accessor<boolean>;
	setPresent: (present: boolean) => void;
}

function readFlag(
	source: boolean | Accessor<boolean> | undefined,
	fallback: boolean,
): boolean {
	if (source === undefined) return fallback;
	if (typeof source === "function") return source();
	return source;
}

function readList<T>(
	source: readonly T[] | Accessor<readonly T[]> | undefined,
): readonly T[] | undefined {
	if (source === undefined) return undefined;
	if (typeof source === "function") {
		const value = source();
		return Array.isArray(value) ? value : undefined;
	}
	return source;
}

export function AnimatePresence<T>(props: AnimatePresenceProps<T>) {
	const block = { current: props.initial === false };
	onMount(() => {
		queueMicrotask(() => {
			block.current = false;
		});
	});

	const objectIds = new WeakMap<object, number>();
	let nextId = 1;

	function keyFor(item: T, _index: number): string {
		if (props.by) return String(props.by(item));
		if (typeof item === "object" && item !== null) {
			const found = objectIds.get(item);
			if (found !== undefined) return `o${found}`;
			const id = nextId;
			nextId += 1;
			objectIds.set(item, id);
			return `o${id}`;
		}
		return `p${String(item)}`;
	}

	const roots = new Map<string, { dispose: () => void; row: Row<T> }>();
	const entered = new Set<string>();

	function ensure(item: T, index: number): Row<T> {
		const key = keyFor(item, index);
		const found = roots.get(key);
		if (found) {
			found.row.item = item;
			found.row.index = index;
			found.row.setPresent(true);
			return found.row;
		}
		let row: Row<T> | undefined;
		const dispose = createRoot((done) => {
			const [present, setPresent] = createSignal(true);
			row = { key, item, index, present, setPresent };
			return done;
		});
		if (!row) throw new Error("AnimatePresence failed to create a row");
		roots.set(key, { dispose, row });
		return row;
	}

	const [order, setOrder] = createSignal<Row<T>[]>(
		untrack(() => {
			const list = readList(props.each);
			if (!list) return [];
			return list.map((item, index) => ensure(item, index));
		}),
	);

	function finish(key: string) {
		entered.delete(key);
		setOrder((rows) => rows.filter((row) => row.key !== key));
		queueMicrotask(() => {
			const found = roots.get(key);
			roots.delete(key);
			found?.dispose();
		});
		const stillExiting = untrack(order).some((row) => !row.present());
		if (!stillExiting) props.onExitComplete?.();
	}

	createEffect(() => {
		const list = readList(props.each);
		if (!list) return;
		const prev = untrack(order);
		const presentRows = list.map((item, index) => ensure(item, index));
		const presentKeys = new Set(presentRows.map((row) => row.key));
		const merged = presentRows.slice();
		prev.forEach((row, index) => {
			if (presentKeys.has(row.key)) return;
			row.setPresent(false);
			merged.splice(Math.min(index, merged.length), 0, row);
		});
		setOrder(merged);
	});

	const shown = createMemo(() => {
		const rows = order();
		const waiting = props.mode === "wait" && rows.some((row) => !row.present());
		const visible: Row<T>[] = [];
		for (const row of rows) {
			if (!row.present()) {
				visible.push(row);
				continue;
			}
			if (waiting && !entered.has(row.key)) continue;
			entered.add(row.key);
			visible.push(row);
		}
		return visible;
	});

	const listMode = createMemo(() => readList(props.each) !== undefined);

	return (
		<Show
			when={listMode()}
			fallback={
				<WhenPresence
					when={props.when}
					mode={props.mode}
					custom={props.custom}
					anchorX={props.anchorX}
					anchorY={props.anchorY}
					block={block}
					onExitComplete={props.onExitComplete}
				>
					{props.children as JSX.Element}
				</WhenPresence>
			}
		>
			<For each={shown()}>
				{(row) => (
					<PresenceScope
						present={row.present}
						mode={props.mode}
						custom={props.custom}
						anchorX={props.anchorX}
						anchorY={props.anchorY}
						block={block}
						onDone={() => finish(row.key)}
					>
						{typeof props.children === "function"
							? props.children(row.item, () => row.index)
							: props.children}
					</PresenceScope>
				)}
			</For>
		</Show>
	);
}

function WhenPresence(props: {
	when?: boolean | Accessor<boolean>;
	mode?: PresenceMode;
	custom?: unknown;
	anchorX?: "left" | "right";
	anchorY?: "top" | "bottom";
	block: { current: boolean };
	onExitComplete?: () => void;
	children?: JSX.Element;
}) {
	const [mounted, setMounted] = createSignal(
		untrack(() => readFlag(props.when, true)),
	);
	const [present, setPresent] = createSignal(true);
	let pendingShow = false;

	createEffect(() => {
		const show = readFlag(props.when, true);
		if (show) {
			if (props.mode === "wait" && untrack(mounted) && !untrack(present)) {
				pendingShow = true;
				return;
			}
			pendingShow = false;
			setMounted(true);
			setPresent(true);
			return;
		}
		if (!untrack(mounted)) return;
		setPresent(false);
	});

	function done() {
		if (readFlag(props.when, true) && props.mode !== "wait") return;
		setMounted(false);
		if (pendingShow || (props.mode === "wait" && readFlag(props.when, true))) {
			pendingShow = false;
			setPresent(true);
			setMounted(true);
			return;
		}
		props.onExitComplete?.();
	}

	return (
		<Show when={mounted()}>
			<PresenceScope
				present={present}
				mode={props.mode}
				custom={props.custom}
				anchorX={props.anchorX}
				anchorY={props.anchorY}
				block={props.block}
				onDone={done}
			>
				{props.children}
			</PresenceScope>
		</Show>
	);
}

function PresenceScope(props: {
	present: Accessor<boolean>;
	mode?: PresenceMode;
	custom?: unknown;
	anchorX?: "left" | "right";
	anchorY?: "top" | "bottom";
	block: { current: boolean };
	onDone: () => void;
	children?: JSX.Element;
}) {
	const exits: Promise<void>[] = [];
	let token = 0;
	const api: PresenceState = {
		isPresent: () => props.present(),
		blockInitial: () => props.block.current,
		popLayout: () => props.mode === "popLayout",
		anchorX: () => props.anchorX ?? "left",
		anchorY: () => props.anchorY ?? "top",
		hasCustom: props.custom !== undefined,
		custom: () => props.custom,
		registerExit(done) {
			exits.push(done);
		},
	};

	createEffect(() => {
		if (props.present()) {
			token += 1;
			exits.length = 0;
			return;
		}
		const current = token + 1;
		token = current;
		queueMicrotask(() => {
			if (current !== token) return;
			const pending = exits.slice();
			if (pending.length === 0) {
				props.onDone();
				return;
			}
			void Promise.all(pending).then(() => {
				if (current === token) props.onDone();
			});
		});
	});

	onCleanup(() => {
		token += 1;
	});

	return (
		<PresenceContext.Provider value={api}>
			{props.children}
		</PresenceContext.Provider>
	);
}
