import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { languages } from "@/i18n/config";

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
				<DropdownMenuRadioGroup value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
					{languages.map((lang) => (
						<DropdownMenuRadioItem key={lang.code} value={lang.code}>
							{lang.label}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
