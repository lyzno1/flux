import { describe, expect, it } from "vitest";
import { parseDifySSE, parseSSELines } from "./sse";

function collect<T>(gen: Generator<T>): T[] {
	return [...gen];
}

async function collectAsync<T>(gen: AsyncGenerator<T>): Promise<T[]> {
	const results: T[] = [];
	for await (const item of gen) results.push(item);
	return results;
}

function toStream(chunks: string[]): ReadableStream<Uint8Array> {
	const encoder = new TextEncoder();
	return new ReadableStream({
		start(controller) {
			for (const chunk of chunks) {
				controller.enqueue(encoder.encode(chunk));
			}
			controller.close();
		},
	});
}

describe("parseSSELines", () => {
	it("parses a data line", () => {
		const state = { currentEvent: "" };
		const result = collect(parseSSELines(['data: {"event":"message","answer":"hi"}'], state));
		expect(result).toEqual([{ event: "message", answer: "hi" }]);
	});

	it("parses event + data pair", () => {
		const state = { currentEvent: "" };
		const lines = ["event: message", 'data: {"event":"message","id":"1"}'];
		const result = collect(parseSSELines(lines, state));
		expect(result).toEqual([{ event: "message", id: "1" }]);
		expect(state.currentEvent).toBe("");
	});

	it("handles ping event", () => {
		const state = { currentEvent: "" };
		const lines = ["event: ping", ""];
		const result = collect(parseSSELines(lines, state));
		expect(result).toEqual([{ event: "ping" }]);
	});

	it("ignores empty lines without ping context", () => {
		const state = { currentEvent: "" };
		const result = collect(parseSSELines([""], state));
		expect(result).toEqual([]);
	});

	it("resets currentEvent after yielding data", () => {
		const state = { currentEvent: "" };
		collect(parseSSELines(["event: message", 'data: {"id":"1"}'], state));
		expect(state.currentEvent).toBe("");
	});

	it("handles multiple data events in sequence", () => {
		const state = { currentEvent: "" };
		const lines = ['data: {"n":1}', 'data: {"n":2}', 'data: {"n":3}'];
		const result = collect(parseSSELines(lines, state));
		expect(result).toEqual([{ n: 1 }, { n: 2 }, { n: 3 }]);
	});

	it("skips lines that are not event/data/empty", () => {
		const state = { currentEvent: "" };
		const lines = [": comment", "id: 123", 'data: {"ok":true}'];
		const result = collect(parseSSELines(lines, state));
		expect(result).toEqual([{ ok: true }]);
	});

	it("preserves state across calls", () => {
		const state = { currentEvent: "" };
		collect(parseSSELines(["event: ping"], state));
		expect(state.currentEvent).toBe("ping");
		const result = collect(parseSSELines([""], state));
		expect(result).toEqual([{ event: "ping" }]);
	});

	it("throws on invalid JSON in data line", () => {
		const state = { currentEvent: "" };
		expect(() => collect(parseSSELines(["data: {not-json}"], state))).toThrow();
	});

	it("trims whitespace from event name", () => {
		const state = { currentEvent: "" };
		collect(parseSSELines(["event:  ping  "], state));
		expect(state.currentEvent).toBe("ping");
	});
});

describe("parseDifySSE", () => {
	it("parses a single-chunk stream", async () => {
		const stream = toStream(['data: {"event":"message","answer":"hello"}\n\n']);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([{ event: "message", answer: "hello" }]);
	});

	it("handles data split across chunks", async () => {
		const stream = toStream(['data: {"ev', 'ent":"done"}\n\n']);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([{ event: "done" }]);
	});

	it("handles multiple events in one chunk", async () => {
		const stream = toStream(['data: {"n":1}\ndata: {"n":2}\n']);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([{ n: 1 }, { n: 2 }]);
	});

	it("handles event + data pairs across chunks", async () => {
		const stream = toStream(["event: ping\n", "\n"]);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([{ event: "ping" }]);
	});

	it("returns empty for empty stream", async () => {
		const stream = toStream([]);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([]);
	});

	it("handles trailing incomplete line", async () => {
		const stream = toStream(['data: {"a":1}\ndata: {"b":2']);
		const result = await collectAsync(parseDifySSE(stream));
		expect(result).toEqual([{ a: 1 }]);
	});

	it("releases the reader lock after completion", async () => {
		const stream = toStream(["data: {}\n"]);
		await collectAsync(parseDifySSE(stream));
		const reader = stream.getReader();
		const { done } = await reader.read();
		expect(done).toBe(true);
		reader.releaseLock();
	});

	it("releases the reader lock on early abort", async () => {
		const stream = toStream(['data: {"n":1}\ndata: {"n":2}\n']);
		const gen = parseDifySSE(stream);
		const first = await gen.next();
		expect(first.value).toEqual({ n: 1 });
		await gen.return(undefined);

		const reader = stream.getReader();
		reader.releaseLock();
	});

	it("propagates invalid JSON error from stream", async () => {
		const stream = toStream(["data: not-valid-json\n"]);
		await expect(collectAsync(parseDifySSE(stream))).rejects.toThrow();
	});
});
