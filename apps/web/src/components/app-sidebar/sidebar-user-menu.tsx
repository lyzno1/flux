import { ChevronsUpDownIcon, GlobeIcon, LogOutIcon, SettingsIcon, SunMoonIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { languages } from "@/i18n/config";
import { authClient } from "@/lib/auth-client";
import { sidebarSelectors } from "@/stores/app/slices/sidebar/selectors";
import { useAppStore } from "@/stores/app/store";

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
	return (
		<Avatar size="sm">
			{image && <AvatarImage src={image} alt={name} />}
			<AvatarFallback>{name[0]?.toUpperCase() ?? "U"}</AvatarFallback>
		</Avatar>
	);
}

function UserMenuContent({ name, email }: { name: string; email: string }) {
	const { t, i18n } = useTranslation();
	const { theme, setTheme } = useTheme();

	const handleSignOut = async () => {
		await authClient.signOut();
	};

	return (
		<>
			<DropdownMenuGroup>
				<DropdownMenuLabel className="flex flex-col gap-0.5">
					<span className="font-semibold text-foreground text-sm">{name}</span>
					<span className="font-normal text-muted-foreground text-xs">{email}</span>
				</DropdownMenuLabel>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem>
					<SettingsIcon />
					{t("user.settings")}
				</DropdownMenuItem>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<GlobeIcon />
						{t("user.language")}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup value={i18n.language} onValueChange={(value) => i18n.changeLanguage(value)}>
							{languages.map((lang) => (
								<DropdownMenuRadioItem key={lang.code} value={lang.code}>
									{lang.label}
								</DropdownMenuRadioItem>
							))}
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SunMoonIcon />
						{t("theme.toggle")}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
							<DropdownMenuRadioItem value="light">{t("theme.light")}</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="dark">{t("theme.dark")}</DropdownMenuRadioItem>
							<DropdownMenuRadioItem value="system">{t("theme.system")}</DropdownMenuRadioItem>
						</DropdownMenuRadioGroup>
					</DropdownMenuSubContent>
				</DropdownMenuSub>
			</DropdownMenuGroup>
			<DropdownMenuSeparator />
			<DropdownMenuGroup>
				<DropdownMenuItem variant="destructive" onClick={handleSignOut}>
					<LogOutIcon />
					{t("user.signOut")}
				</DropdownMenuItem>
			</DropdownMenuGroup>
		</>
	);
}

const triggerButton = (
	<button
		type="button"
		className="flex w-full items-center gap-2 overflow-hidden rounded-lg p-2 outline-none hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-sidebar-ring"
	/>
);

export function SidebarUserMenu() {
	const collapsed = useAppStore(sidebarSelectors.isSidebarCollapsed);
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-10 w-full rounded-lg" />;
	}

	if (!session) {
		return null;
	}

	const { name, email, image } = session.user;

	const triggerContent = (
		<>
			<UserAvatar name={name} image={image} />
			<div className="flex min-w-0 flex-1 flex-col overflow-hidden text-left transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
				<span className="truncate font-medium text-sidebar-foreground text-sm">{name}</span>
				<span className="truncate text-muted-foreground text-xs">{email}</span>
			</div>
			<ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none" />
		</>
	);

	return (
		<DropdownMenu>
			<Tooltip disabled={!collapsed}>
				<TooltipTrigger render={<DropdownMenuTrigger render={triggerButton} />}>{triggerContent}</TooltipTrigger>
				{collapsed ? <TooltipContent side="right">{name}</TooltipContent> : null}
			</Tooltip>
			<DropdownMenuContent side="top" align="start" sideOffset={8} className="w-62">
				<UserMenuContent name={name} email={email} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
