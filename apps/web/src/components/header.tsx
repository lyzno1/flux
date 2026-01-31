import { Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./mode-toggle";
import { UserMenu } from "./user-menu";

const HEADER_LINKS = [
	{ to: "/", labelKey: "nav.home" },
	{ to: "/dashboard", labelKey: "nav.dashboard" },
	{ to: "/dify", labelKey: "nav.dify" },
] as const;

export function Header() {
	const { t } = useTranslation();

	return (
		<div>
			<div className="flex flex-row items-center justify-between px-2 py-1">
				<nav className="flex gap-4 text-lg">
					{HEADER_LINKS.map(({ to, labelKey }) => {
						return (
							<Link key={to} to={to}>
								{t(labelKey)}
							</Link>
						);
					})}
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
