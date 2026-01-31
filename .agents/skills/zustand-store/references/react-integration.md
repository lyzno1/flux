# React Integration

## Global Store (Default)

Most stores are global singletons created at module scope:

```tsx
import { useGlobalStore } from "@flux/store";
import { sidebarSelectors } from "@flux/store";

function Sidebar() {
  const isOpen = useGlobalStore(sidebarSelectors.isSidebarOpen);
  const toggle = useGlobalStore((s) => s.toggleSidebar);

  if (!isOpen) return null;
  return <aside><button onClick={toggle}>Close</button></aside>;
}
```

## Context Store (Isolated Instances)

Use `createContext` from `zustand-utils` when a store needs per-subtree isolation (e.g., editor instances, modals with local state):

```tsx
// stores/editor/store.ts
import { createContext } from "zustand-utils";
import { shallow } from "zustand/shallow";
import { createWithEqualityFn } from "zustand/traditional";

interface EditorState {
  content: string;
  dirty: boolean;
  setContent: (content: string) => void;
}

const createEditorStore = (initialContent: string) =>
  createWithEqualityFn<EditorState>(
    (set) => ({
      content: initialContent,
      dirty: false,
      setContent: (content) => set({ content, dirty: true }),
    }),
    shallow,
  );

export const {
  Provider: EditorProvider,
  useStore: useEditorStore,
  useStoreApi: useEditorStoreApi,
} = createContext<ReturnType<typeof createEditorStore>>();

export { createEditorStore };
```

```tsx
// usage
function EditorContainer({ initialContent }: { initialContent: string }) {
  return (
    <EditorProvider createStore={() => createEditorStore(initialContent)}>
      <EditorView />
    </EditorProvider>
  );
}
```

## StoreUpdater Pattern

Sync external props into a store without re-creating it:

```tsx
import { createStoreUpdater } from "zustand-utils";

function StoreSync({ theme, locale }: { theme: string; locale: string }) {
  const useUpdate = createStoreUpdater(useGlobalStore);
  useUpdate("theme", theme);
  useUpdate("locale", locale);
  return null;
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

Requires `subscribeWithSelector` middleware (included in `createFluxStore`).
