import { Loader2 } from "lucide-react";

export function PageLoading() {
	return (
		<div className="fixed inset-0 flex items-center justify-center bg-background">
			<Loader2 className="size-10 animate-spin text-muted-foreground" />
		</div>
	);
}
