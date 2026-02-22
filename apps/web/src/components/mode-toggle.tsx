import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ModeToggle() {
	const { theme, setTheme } = useTheme();
	const { t } = useTranslation();

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={<Button variant="outline" size="icon" className="cursor-pointer" aria-label={t("theme.toggle")} />}
			>
				<Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-[opacity,transform] dark:-rotate-90 dark:scale-0" />
				<Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-[opacity,transform] dark:rotate-0 dark:scale-100" />
				<span className="sr-only">{t("theme.toggle")}</span>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
					<DropdownMenuRadioItem value="light">{t("theme.light")}</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark">{t("theme.dark")}</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system">{t("theme.system")}</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
