# React Integration

## Global Store (Default)

Most stores are global singletons created at module scope:

```tsx
import { useGlobalStore } from "@/stores/global";
import { sidebarSelectors } from "@/stores/global";

function Sidebar() {
	const isOpen = useGlobalStore(sidebarSelectors.isSidebarOpen);
	const toggle = useGlobalStore((s) => s.toggleSidebar);

	if (!isOpen) return null;
	return <aside><button onClick={toggle}>Close</button></aside>;
}
```

## Context Store (Isolated Instances)

Use React context when a store needs per-subtree isolation (e.g., editor instances, modals with local state):

```tsx
// apps/web/src/stores/editor/store.ts
import { createStore as createZustandStore } from "zustand";
import { useContext, createContext, useRef } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";
import { shallow } from "zustand/shallow";

interface EditorState {
	content: string;
	dirty: boolean;
	setContent: (content: string) => void;
}

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

```tsx
// usage
function EditorContainer({ initialContent }: { initialContent: string }) {
	return (
		<EditorProvider initialContent={initialContent}>
			<EditorView />
		</EditorProvider>
	);
}
```

## Subscribe Outside React

```ts
const unsub = useGlobalStore.subscribe(
	(s) => s.sidebarOpen,
	(open) => console.log("sidebar:", open),
	{ fireImmediately: true },
);
```

Requires `subscribeWithSelector` middleware (included in `createStore`).
