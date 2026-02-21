import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";

export function Header() {
	return (
		<header className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-row items-center justify-end bg-transparent px-4 py-2.5">
			<div className="pointer-events-auto flex items-center gap-2">
				<LanguageToggle />
				<ModeToggle />
			</div>
		</header>
	);
}
