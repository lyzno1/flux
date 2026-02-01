import { act } from "@testing-library/react";
import { afterEach } from "vitest";
import { createWithEqualityFn as actualCreate } from "zustand/traditional";

const storeResetFns = new Set<() => void>();

// biome-ignore lint/suspicious/noExplicitAny: mock internals
const createImpl = (createState: any) => {
	const store = actualCreate(createState, Object.is);
	const initialState = store.getState();
	storeResetFns.add(() => store.setState(initialState, true));
	return store;
};

afterEach(() => {
	act(() => {
		for (const resetFn of storeResetFns) {
			resetFn();
		}
	});
});

// biome-ignore lint/suspicious/noExplicitAny: mock internals
export const createWithEqualityFn = (f: any) => (f === undefined ? createImpl : createImpl(f));
