import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

export function Header() {
	const { t } = useTranslation();

	const headerLinks = [
		{ to: "/", label: t("nav.home") },
		{ to: "/dashboard", label: t("nav.dashboard") },
		{ to: "/dify", label: t("nav.dify") },
	] as const;

	return (
		<header className="flex flex-row items-center justify-between border-border border-b px-4 py-2.5">
			<nav className="flex gap-1 text-sm">
				{headerLinks.map(({ to, label }) => (
					<Link
						key={to}
						to={to}
						className="rounded-lg px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
					>
						{label}
					</Link>
				))}
			</nav>
			<div className="flex items-center gap-2">
				<LanguageToggle />
				<ModeToggle />
				<UserMenu />
			</div>
		</header>
	);
}
