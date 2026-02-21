import { Loader2 } from "lucide-react";
import type { PromptInputAttachmentStatus } from "./types";

type PromptInputAttachmentStatusBadgeProps = {
	errorLabel?: string;
	status: PromptInputAttachmentStatus;
	uploadedLabel?: string;
	uploadingLabel?: string;
};

function PromptInputAttachmentStatusBadge({
	status,
	uploadingLabel = "Uploading",
	uploadedLabel = "Uploaded",
	errorLabel = "Upload failed",
}: PromptInputAttachmentStatusBadgeProps) {
	if (status === "uploading") {
		return (
			<span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
				<Loader2 className="size-3 animate-spin motion-reduce:animate-none" aria-hidden="true" />
				{uploadingLabel}
			</span>
		);
	}

	if (status === "uploaded") {
		return <span className="text-muted-foreground text-xs">{uploadedLabel}</span>;
	}

	if (status === "error") {
		return <span className="text-destructive text-xs">{errorLabel}</span>;
	}

	return null;
}

export { PromptInputAttachmentStatusBadge };
