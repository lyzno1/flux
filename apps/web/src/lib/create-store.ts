import { isClient } from "@flux/utils/runtime";
import type { Mutate, StateCreator, StoreApi } from "zustand";
import type { PersistOptions } from "zustand/middleware";
import { devtools, persist, subscribeWithSelector } from "zustand/middleware";
import { shallow } from "zustand/shallow";
import type { UseBoundStoreWithEqualityFn } from "zustand/traditional";
import { createWithEqualityFn } from "zustand/traditional";

type DevtoolsMw = ["zustand/devtools", never];
type PersistMw = ["zustand/persist", unknown];
type SelectorMw = ["zustand/subscribeWithSelector", never];
type DevtoolsCreator<T> = StateCreator<T, [DevtoolsMw]>;
type PersistedCreator<T> = StateCreator<T, [DevtoolsMw, PersistMw]>;
type PersistConfig<T> = { persist: PersistOptions<T, unknown> };
type StoreWithSelectorDevtools<T> = UseBoundStoreWithEqualityFn<Mutate<StoreApi<T>, [SelectorMw, DevtoolsMw]>>;
type StoreWithSelectorDevtoolsPersist<T> = UseBoundStoreWithEqualityFn<
	Mutate<StoreApi<T>, [SelectorMw, DevtoolsMw, PersistMw]>
>;

export function createStore<T>(name: string, storeCreator: DevtoolsCreator<T>): StoreWithSelectorDevtools<T>;

export function createStore<T>(
	name: string,
	storeCreator: PersistedCreator<T>,
	options: PersistConfig<T>,
): StoreWithSelectorDevtoolsPersist<T>;

export function createStore<T>(
	name: string,
	storeCreator: DevtoolsCreator<T> | PersistedCreator<T>,
	options?: PersistConfig<T>,
): StoreWithSelectorDevtools<T> | StoreWithSelectorDevtoolsPersist<T> {
	const devtoolsConfig = {
		name: `Flux_${name}`,
		enabled: import.meta.env.DEV && isClient,
	};

	if (options) {
		const persistedCreator = storeCreator as PersistedCreator<T>;
		return createWithEqualityFn<T>()(
			subscribeWithSelector(devtools(persist(persistedCreator, options.persist), devtoolsConfig)),
			shallow,
		) as StoreWithSelectorDevtoolsPersist<T>;
	}

	const nonPersistedCreator = storeCreator as DevtoolsCreator<T>;
	return createWithEqualityFn<T>()(
		subscribeWithSelector(devtools(nonPersistedCreator, devtoolsConfig)),
		shallow,
	) as StoreWithSelectorDevtools<T>;
}
