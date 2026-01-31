import { describe, expect, it } from "vitest";
import { createStore } from "./create-store";

interface CounterState {
	count: number;
	increment: () => void;
}

describe("createStore", () => {
	it("creates a store with initial state", () => {
		const useStore = createStore("test", () => ({
			count: 0,
		}));

		expect(useStore.getState().count).toBe(0);
	});

	it("supports state updates", () => {
		const useStore = createStore<CounterState>("test-update", (set) => ({
			count: 0,
			increment: () => set((state) => ({ count: state.count + 1 })),
		}));

		useStore.getState().increment();
		expect(useStore.getState().count).toBe(1);
	});
});
