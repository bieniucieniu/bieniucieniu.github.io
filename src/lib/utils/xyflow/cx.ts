export function cx(
	...parts: Array<
		string | false | null | undefined | Record<string, boolean | undefined>
	>
): string {
	const out: string[] = [];
	for (const part of parts) {
		if (!part) continue;
		if (typeof part === "string") {
			out.push(part);
			continue;
		}
		for (const key in part) {
			if (part[key]) out.push(key);
		}
	}
	return out.join(" ");
}
