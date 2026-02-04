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
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{headerLinks.map(({ to, label }) => (
						<Link key={to} to={to}>
							{label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-2">
					<LanguageToggle />
					<ModeToggle />
					<UserMenu />
				</div>
			</div>
			<hr />
		</div>
	);
}
