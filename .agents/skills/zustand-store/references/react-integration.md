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

## Composition Hook Pattern

Wrap store access in a custom hook for cohesive APIs:

```ts
// apps/web/src/hooks/use-sidebar.ts
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { getAppStoreState, useAppStore } from "@/stores/app/store";
import { useIsMobile } from "./use-is-mobile";

export function useSidebar() {
	// Subscribe to state that affects rendering
	const open = useAppStore(sidebarSelectors.isSidebarOpen);
	const state = useAppStore(sidebarSelectors.sidebarState);
	const isMobile = useIsMobile();

	return {
		open,
		state,
		isMobile,
		// Actions via getState() — no subscriptions (Vercel: rerender-defer-reads)
		toggleSidebar: getAppStoreState().toggleSidebar,
		setSidebarOpen: getAppStoreState().setSidebarOpen,
	};
}
```

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
