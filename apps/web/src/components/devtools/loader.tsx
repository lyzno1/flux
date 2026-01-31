import { lazy, Suspense } from "react";

const Devtools = lazy(() =>
	import("./devtools").then((m) => ({ default: m.Devtools })),
);

export function DevtoolsLoader() {
	if (import.meta.env.PROD) return null;

	return (
		<Suspense fallback={null}>
			<Devtools />
		</Suspense>
	);
}
