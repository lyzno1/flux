import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/i18n";

export function LanguageToggle() {
	const { i18n } = useTranslation();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" size="icon" className="cursor-pointer" aria-label="Change language" />}
			>
				<Languages className="h-[1.2rem] w-[1.2rem]" />
				<span className="sr-only">Change language</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{languages.map((lang) => (
					<DropdownMenuItem
						key={lang.code}
						disabled={i18n.language === lang.code}
						onClick={() => i18n.changeLanguage(lang.code)}
					>
						{lang.label}
					</DropdownMenuItem>
				))}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
