import { lazy, Suspense } from "react";

const Devtools = import.meta.env.DEV
	? lazy(() => import("./devtools").then((m) => ({ default: m.Devtools })))
	: () => null;

export function DevtoolsLoader() {
	return (
		<Suspense fallback={null}>
			<Devtools />
		</Suspense>
	);
}
