import { describe, expect, it, vi } from "vitest";
import { createStore } from "./create-store";

interface CounterState {
	count: number;
	name: string;
	increment: () => void;
	setName: (name: string) => void;
}

function createCounterStore(storeName = "test") {
	return createStore<CounterState>(storeName, (set) => ({
		count: 0,
		name: "default",
		increment: () => set((state) => ({ count: state.count + 1 })),
		setName: (name: string) => set({ name }),
	}));
}

describe("createStore", () => {
	it("creates a store with initial state", () => {
		const useStore = createStore("test", () => ({
			count: 0,
		}));

		expect(useStore.getState().count).toBe(0);
	});

	it("supports state updates", () => {
		const useStore = createCounterStore("test-update");

		useStore.getState().increment();
		expect(useStore.getState().count).toBe(1);
	});

	it("supports partial state updates", () => {
		const useStore = createCounterStore("test-partial");

		useStore.getState().setName("alice");
		expect(useStore.getState().name).toBe("alice");
		expect(useStore.getState().count).toBe(0);
	});

	it("uses shallow equality by default", () => {
		const useStore = createCounterStore("test-shallow");
		const listener = vi.fn();

		useStore.subscribe((state) => state.count, listener);

		useStore.getState().setName("bob");
		expect(listener).not.toHaveBeenCalled();

		useStore.getState().increment();
		expect(listener).toHaveBeenCalledOnce();
	});

	it("supports subscribeWithSelector", () => {
		const useStore = createCounterStore("test-selector");
		const listener = vi.fn();

		useStore.subscribe((state) => state.name, listener);

		useStore.getState().setName("carol");
		expect(listener).toHaveBeenCalledWith("carol", "default");
	});

	it("supports getState/setState directly", () => {
		const useStore = createCounterStore("test-setstate");

		useStore.setState({ count: 42 });
		expect(useStore.getState().count).toBe(42);
	});
});
