import { Link, useMatches, useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

export function UserMenu() {
	const navigate = useNavigate();
	const matches = useMatches();
	const { t } = useTranslation();
	const { data: session, isPending } = authClient.useSession();
	const isAuthRoute = matches.some((match) => match.routeId === "/_auth" || match.routeId.startsWith("/_auth/"));

	if (isPending) {
		return <Skeleton className="h-9 w-24" />;
	}

	if (!session) {
		if (isAuthRoute) {
			return (
				<Link to="/">
					<Button variant="outline" className="cursor-pointer">
						{t("user.close")}
					</Button>
				</Link>
			);
		}

		return (
			<Link to="/login">
				<Button variant="outline" className="cursor-pointer">
					{t("user.signIn")}
				</Button>
			</Link>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger render={<Button variant="outline" className="cursor-pointer" />}>
				{session.user.name}
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-auto min-w-(--anchor-width) bg-card">
				<DropdownMenuGroup>
					<DropdownMenuLabel className="font-semibold text-foreground">{t("user.myAccount")}</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuItem>{session.user.email}</DropdownMenuItem>
					<DropdownMenuItem
						variant="destructive"
						onClick={() => {
							authClient.signOut({
								fetchOptions: {
									onSuccess: () => {
										navigate({
											to: "/",
										});
									},
								},
							});
						}}
					>
						{t("user.signOut")}
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
