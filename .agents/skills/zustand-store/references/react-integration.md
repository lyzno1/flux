# React Integration

## Global Store (Default)

Most stores are global singletons created at module scope:

```tsx
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { getAppStoreState, useAppStore } from "@/stores/app/store";

function Sidebar() {
	const isOpen = useAppStore(sidebarSelectors.isSidebarOpen);

	// Access actions via getState() — no subscription created (Vercel: rerender-defer-reads)
	const handleToggle = () => {
		getAppStoreState().toggleSidebar();
	};

	if (!isOpen) return null;
	return <aside><button onClick={handleToggle}>Close</button></aside>;
}
```

## Direct Store Access (Preferred)

Each component imports exactly the selectors and actions it needs — no facade hooks:

```tsx
// Action-only component — zero subscriptions (Vercel: rerender-defer-reads)
import { getAppStoreState } from "@/stores/app/store";

function SidebarTrigger() {
	const toggleSidebar = getAppStoreState().toggleSidebar;
	return <button onClick={toggleSidebar}>Toggle</button>;
}

// State-reading component — minimal subscriptions
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { useAppStore } from "@/stores/app/store";

function AppSidebarHeader() {
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);
	return <div>{collapsed ? "F" : "Flux"}</div>;
}
```

Avoid creating "facade hooks" (like `useSidebar()`) that bundle unrelated state — they force every consumer to subscribe to everything, similar to barrel files for state.

## Context Store (Isolated Instances)

Use React context when a store needs per-subtree isolation (e.g. editor instances, modals with local state):

```tsx
// apps/web/src/stores/editor/store.ts
import { createStore as createZustandStore } from "zustand";
import { useContext, createContext, useRef } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

type EditorState = {
	content: string;
	dirty: boolean;
	setContent: (content: string) => void;
};

export const createEditorStore = (initialContent: string) =>
	createZustandStore<EditorState>((set) => ({
		content: initialContent,
		dirty: false,
		setContent: (content) => set({ content, dirty: true }),
	}));

type EditorStore = ReturnType<typeof createEditorStore>;

const EditorStoreContext = createContext<EditorStore | null>(null);

export function EditorProvider({
	initialContent,
	children,
}: {
	initialContent: string;
	children: React.ReactNode;
}) {
	const storeRef = useRef<EditorStore>(null);
	if (!storeRef.current) {
		storeRef.current = createEditorStore(initialContent);
	}
	return (
		<EditorStoreContext value={storeRef.current}>
			{children}
		</EditorStoreContext>
	);
}

export function useEditorStore<T>(selector: (s: EditorState) => T) {
	const store = useContext(EditorStoreContext);
	if (!store) throw new Error("useEditorStore must be used within EditorProvider");
	return useStoreWithEqualityFn(store, selector, shallow);
}
```

## Subscribe Outside React

```ts
const unsub = useAppStore.subscribe(
	(s) => s.sidebarOpen,
	(open) => { /* react to change */ },
	{ fireImmediately: true },
);
```

Requires `subscribeWithSelector` middleware (included in `createStore`).
