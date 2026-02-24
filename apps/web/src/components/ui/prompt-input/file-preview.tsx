import type { LucideIcon } from "lucide-react";
import { File, FileArchive, FileAudio, FileCode, FileImage, FileText, FileVideo } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import type { PromptInputFileKind } from "./file-metadata";

const FILE_KIND_ICON_MAP: Record<PromptInputFileKind, LucideIcon> = {
	archive: FileArchive,
	audio: FileAudio,
	code: FileCode,
	document: FileText,
	image: FileImage,
	unknown: File,
	video: FileVideo,
};

type PromptInputFilePreviewProps = {
	fileKind: PromptInputFileKind;
	name: string;
	previewUrl?: string | null;
};

function PromptInputFilePreview({ fileKind, previewUrl, name }: PromptInputFilePreviewProps) {
	const Icon = FILE_KIND_ICON_MAP[fileKind];
	const canPreviewImage = fileKind === "image" && Boolean(previewUrl);

	if (!canPreviewImage || !previewUrl) {
		return (
			<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
				<Icon className="size-4" aria-hidden="true" />
			</div>
		);
	}

	return (
		<HoverCard>
			<HoverCardTrigger
				render={
					<button
						type="button"
						className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50 motion-reduce:transition-none"
					>
						<img
							src={previewUrl}
							alt={name}
							width={40}
							height={40}
							loading="lazy"
							decoding="async"
							className="size-full object-cover"
						/>
					</button>
				}
			/>
			<HoverCardContent side="top" align="start" className="w-72 p-2">
				<div className="overflow-hidden rounded-lg bg-muted">
					<img
						src={previewUrl}
						alt={name}
						width={288}
						height={320}
						loading="lazy"
						decoding="async"
						className="max-h-80 w-full object-contain"
					/>
				</div>
			</HoverCardContent>
		</HoverCard>
	);
}

export { PromptInputFilePreview };
