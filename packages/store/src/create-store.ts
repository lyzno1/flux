import { isClient } from "@flux/utils/runtime";
import type { StateCreator } from "zustand";
import { devtools, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

function shouldEnableDevtools(name: string) {
	if (!isClient) return false;
	const debug = new URL(window.location.href).searchParams.get("debug");
	return debug?.includes(name) ?? false;
}

interface CreateStoreOptions {
	devtools?: string;
}

export function createStore<T>(
	name: string,
	storeCreator: StateCreator<T, [["zustand/devtools", never]]>,
	options?: CreateStoreOptions,
) {
	const devtoolsName = options?.devtools ?? name;
	const enabled = shouldEnableDevtools(devtoolsName);

	return createWithEqualityFn<T>()(
		subscribeWithSelector(
			devtools(storeCreator, {
				name: `Flux_${devtoolsName}`,
				enabled,
			}),
		),
		shallow,
	);
}
