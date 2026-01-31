export function* parseSSELines(lines: string[], state: { currentEvent: string }) {
	for (const line of lines) {
		if (line.startsWith("event: ")) {
			state.currentEvent = line.slice(7).trim();
		} else if (line.startsWith("data: ")) {
			yield JSON.parse(line.slice(6));
			state.currentEvent = "";
		} else if (line === "" && state.currentEvent === "ping") {
			yield { event: "ping" as const };
			state.currentEvent = "";
		}
	}
}

export async function* parseDifySSE(stream: ReadableStream<Uint8Array>) {
	const reader = stream.getReader();
	const decoder = new TextDecoder();
	let buffer = "";
	const state = { currentEvent: "" };

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });
			const lines = buffer.split("\n");
			buffer = lines.pop() ?? "";

			yield* parseSSELines(lines, state);
		}
	} finally {
		reader.releaseLock();
	}
}
