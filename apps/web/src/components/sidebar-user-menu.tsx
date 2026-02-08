import { useRouter } from "@tanstack/react-router";
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
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { languages } from "@/i18n";
import { authClient } from "@/lib/auth-client";

function UserAvatar({ name, image }: { name: string; image?: string | null }) {
	return (
		<Avatar size="sm">
			{image && <AvatarImage src={image} alt={name} />}
			<AvatarFallback>{name[0]?.toUpperCase() ?? "U"}</AvatarFallback>
		</Avatar>
	);
}

function UserMenuContent({ name, email }: { name: string; email: string }) {
	const router = useRouter();
	const { t, i18n } = useTranslation();
	const { setTheme } = useTheme();
	const { refetch } = authClient.useSession();

	const handleSignOut = async () => {
		await authClient.signOut();
		await refetch();
		try {
			await router.invalidate({ sync: true });
			await router.navigate({
				to: "/login",
				search: { redirect: "/dify" },
				replace: true,
			});
		} catch {
			window.location.assign("/login?redirect=%2Fdify");
		}
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
						{languages.map((lang) => (
							<DropdownMenuItem
								key={lang.code}
								disabled={i18n.language === lang.code}
								onClick={() => i18n.changeLanguage(lang.code)}
							>
								{lang.label}
							</DropdownMenuItem>
						))}
					</DropdownMenuSubContent>
				</DropdownMenuSub>
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>
						<SunMoonIcon />
						{t("theme.toggle")}
					</DropdownMenuSubTrigger>
					<DropdownMenuSubContent>
						<DropdownMenuItem onClick={() => setTheme("light")}>{t("theme.light")}</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("dark")}>{t("theme.dark")}</DropdownMenuItem>
						<DropdownMenuItem onClick={() => setTheme("system")}>{t("theme.system")}</DropdownMenuItem>
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

export function SidebarUserMenu() {
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-10 w-full rounded-lg" />;
	}

	if (!session) {
		return null;
	}

	const { name, email, image } = session.user;

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className="flex w-full items-center gap-2 overflow-hidden rounded-lg p-2 outline-none hover:bg-sidebar-accent focus-visible:ring-1 focus-visible:ring-sidebar-ring"
					/>
				}
			>
				<UserAvatar name={name} image={image} />
				<div className="flex min-w-0 flex-1 flex-col overflow-hidden text-left transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none">
					<span className="truncate font-medium text-sidebar-foreground text-sm">{name}</span>
					<span className="truncate text-muted-foreground text-xs">{email}</span>
				</div>
				<ChevronsUpDownIcon className="ml-auto size-4 shrink-0 text-muted-foreground transition-opacity duration-200 group-data-[state=collapsed]/sidebar-wrapper:opacity-0 motion-reduce:transition-none" />
			</DropdownMenuTrigger>
			<DropdownMenuContent side="top" align="start" sideOffset={8} className="w-[15.5rem]">
				<UserMenuContent name={name} email={email} />
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
