import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

export function Header() {
	return (
		<header className="relative z-20 flex flex-row items-center justify-end bg-transparent px-4 py-2.5">
			<div className="flex items-center gap-2">
				<LanguageToggle />
				<ModeToggle />
				<UserMenu />
			</div>
		</header>
	);
}
