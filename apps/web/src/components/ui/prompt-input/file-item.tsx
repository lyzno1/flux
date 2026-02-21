import { X } from "lucide-react";
import type * as React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { PromptInputAttachmentStatusBadge } from "./attachment-status";
import { formatPromptInputFileSize, inferPromptInputFileKind } from "./file-metadata";
import { PromptInputFilePreview } from "./file-preview";
import type { PromptInputAttachment } from "./types";

function normalizeProgress(progress: number | null | undefined): number | null {
	if (typeof progress !== "number" || Number.isNaN(progress)) {
		return null;
	}
	return Math.max(0, Math.min(100, progress));
}

type PromptInputFileItemProps = React.ComponentProps<"div"> & {
	attachment: PromptInputAttachment;
	errorLabel?: string;
	onRemove?: (attachmentId: string) => void;
	removeLabel?: string;
	uploadedLabel?: string;
	uploadingLabel?: string;
};

function PromptInputFileItem({
	attachment,
	className,
	errorLabel = "Upload failed",
	onRemove,
	removeLabel = "Remove file",
	uploadedLabel = "Uploaded",
	uploadingLabel = "Uploading",
	...props
}: PromptInputFileItemProps) {
	const status = attachment.status ?? "idle";
	const progress = normalizeProgress(attachment.progress);
	const fileKind = attachment.fileKind ?? inferPromptInputFileKind(attachment.name, attachment.mimeType);

	return (
		<div
			data-slot="prompt-input-file-item"
			className={cn(
				"flex h-20 items-center gap-2 rounded-lg bg-muted/50 p-2 ring-1 ring-foreground/10 motion-reduce:transition-none",
				className,
			)}
			{...props}
		>
			<PromptInputFilePreview fileKind={fileKind} previewUrl={attachment.previewUrl} name={attachment.name} />

			<div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
				<p className="truncate font-medium text-sm">{attachment.name}</p>
				<p className="truncate text-muted-foreground text-xs">
					{formatPromptInputFileSize(attachment.size)}
					{attachment.mimeType ? ` · ${attachment.mimeType}` : ""}
				</p>
				{status === "error" && attachment.errorMessage ? (
					<p className="truncate text-destructive text-xs">{attachment.errorMessage}</p>
				) : null}
				{status === "uploading" && progress !== null ? <Progress value={progress} className="mt-1 gap-1" /> : null}
			</div>

			<div className="flex shrink-0 flex-col items-end justify-center gap-1">
				<PromptInputAttachmentStatusBadge
					status={status}
					errorLabel={errorLabel}
					uploadedLabel={uploadedLabel}
					uploadingLabel={uploadingLabel}
				/>
				{onRemove ? (
					<Button
						variant="ghost"
						size="icon-xs"
						className="rounded-lg"
						onClick={() => onRemove(attachment.id)}
						aria-label={removeLabel}
					>
						<X aria-hidden="true" />
					</Button>
				) : null}
			</div>
		</div>
	);
}

export { PromptInputFileItem };
export type { PromptInputFileItemProps };
