import { afterEach, describe, expect, it, vi } from "vitest";
import { createStore, shouldEnableDevtools } from "./create-store";

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

	it("accepts custom devtools name via options", () => {
		const useStore = createStore("internal-name", () => ({ value: 1 }), { devtools: "CustomName" });
		expect(useStore.getState().value).toBe(1);
	});
});

describe("shouldEnableDevtools", () => {
	const originalLocation = window.location;

	afterEach(() => {
		Object.defineProperty(window, "location", {
			writable: true,
			value: originalLocation,
		});
	});

	function setUrl(url: string) {
		Object.defineProperty(window, "location", {
			writable: true,
			value: { href: url },
		});
	}

	it("returns false without debug param", () => {
		setUrl("http://localhost:3000");
		expect(shouldEnableDevtools("myStore")).toBe(false);
	});

	it("returns true when debug param matches store name", () => {
		setUrl("http://localhost:3000?debug=myStore");
		expect(shouldEnableDevtools("myStore")).toBe(true);
	});

	it("returns false when debug param does not match", () => {
		setUrl("http://localhost:3000?debug=otherStore");
		expect(shouldEnableDevtools("myStore")).toBe(false);
	});

	it("returns true when debug param contains store name among others", () => {
		setUrl("http://localhost:3000?debug=fooStore,myStore,barStore");
		expect(shouldEnableDevtools("myStore")).toBe(true);
	});

	it("returns false for partial name match when name is substring", () => {
		setUrl("http://localhost:3000?debug=myStorePlus");
		expect(shouldEnableDevtools("myStore")).toBe(true);
	});
});
