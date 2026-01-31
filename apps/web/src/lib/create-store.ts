import { isClient } from "@flux/utils/runtime";
import type { StateCreator } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

export function createStore<T>(name: string, storeCreator: StateCreator<T, [["zustand/devtools", never]]>) {
	return createWithEqualityFn<T>()(
		subscribeWithSelector(
			devtools(storeCreator, {
				name: `Flux_${name}`,
				enabled: import.meta.env.DEV && isClient,
			}),
		),
		shallow,
	);
}
