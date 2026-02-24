import { Paperclip, X } from "lucide-react";
import type { ChangeEvent, FocusEventHandler, Ref } from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptInput } from "@/components/ui/prompt-input";
import { PromptInputFileItem } from "@/components/ui/prompt-input/file-item";
import { PromptInputFileList } from "@/components/ui/prompt-input/file-list";
import { PromptInputInput } from "@/components/ui/prompt-input/input";
import { PromptInputSubmitSlot } from "@/components/ui/prompt-input/submit-slot";
import { PromptInputToolSlot } from "@/components/ui/prompt-input/tool-slot";
import { PromptInputToolbar } from "@/components/ui/prompt-input/toolbar";
import type { PromptInputAttachment } from "@/components/ui/prompt-input/types";
import { PromptInputUploadArea } from "@/components/ui/prompt-input/upload-area";

type AppPromptInputLabels = {
	attachFiles: string;
	clearFiles: string;
	fileUploadFailed: string;
	fileUploaded: string;
	fileUploading: string;
	removeFile: string;
	send: string;
	stop: string;
	streaming: string;
	uploadEmpty: string;
	uploadHelper: string;
};

type AppPromptInputProps = {
	attachments: PromptInputAttachment[];
	canSubmit: boolean;
	mode?: "disabled" | "ready" | "streaming";
	fileAccept?: string;
	fileCountText?: string;
	inputId: string;
	inputName?: string;
	inputRef?: Ref<HTMLTextAreaElement>;
	labels: AppPromptInputLabels;
	onChange: (value: string) => void;
	onClearFiles: () => void;
	onInitialFocus?: FocusEventHandler<HTMLTextAreaElement>;
	onRemoveAttachment: (attachmentId: string) => void;
	onSelectFiles: (files: FileList) => void;
	onStop?: () => void;
	onSubmit: () => void;
	placeholder?: string;
	rejectedFileMessages?: string[];
	value: string;
};

function AppPromptInput({
	attachments,
	canSubmit,
	mode = "ready",
	fileAccept,
	fileCountText,
	inputId,
	inputName,
	inputRef,
	labels,
	onChange,
	onClearFiles,
	onInitialFocus,
	onRemoveAttachment,
	onSelectFiles,
	onStop,
	onSubmit,
	placeholder,
	rejectedFileMessages,
	value,
}: AppPromptInputProps) {
	const isDisabled = mode === "disabled";
	const isStreaming = mode === "streaming";
	const disableEditingControls = isDisabled || isStreaming;
	const shouldDisableFieldset = isDisabled;
	const [uploadAreaOpen, setUploadAreaOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleOpenFilePicker = useCallback(() => {
		setUploadAreaOpen(true);
		fileInputRef.current?.click();
	}, []);

	const handleFileInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = event.currentTarget.files;
			if (selectedFiles && selectedFiles.length > 0) {
				onSelectFiles(selectedFiles);
				setUploadAreaOpen(true);
			}
			event.currentTarget.value = "";
		},
		[onSelectFiles],
	);

	const handleClearFiles = useCallback(() => {
		onClearFiles();
		setUploadAreaOpen(false);
	}, [onClearFiles]);

	const attachmentItems = useMemo(
		() =>
			attachments.map((attachment) => (
				<PromptInputFileItem
					key={attachment.id}
					attachment={attachment}
					onRemove={onRemoveAttachment}
					removeDisabled={disableEditingControls}
					removeLabel={labels.removeFile}
					uploadingLabel={labels.fileUploading}
					uploadedLabel={labels.fileUploaded}
					errorLabel={labels.fileUploadFailed}
				/>
			)),
		[
			attachments,
			disableEditingControls,
			labels.fileUploadFailed,
			labels.fileUploaded,
			labels.fileUploading,
			labels.removeFile,
			onRemoveAttachment,
		],
	);

	return (
		<PromptInput disabled={shouldDisableFieldset}>
			{uploadAreaOpen ? (
				<PromptInputUploadArea>
					<div className="mb-2 flex items-center justify-between gap-2">
						<p className="text-muted-foreground text-xs">{labels.uploadHelper}</p>
						<Button
							variant="ghost"
							size="icon-xs"
							className="rounded-lg"
							onClick={handleClearFiles}
							aria-label={labels.clearFiles}
							disabled={disableEditingControls}
						>
							<X aria-hidden="true" />
						</Button>
					</div>

					{attachments.length > 0 ? (
						<PromptInputFileList>{attachmentItems}</PromptInputFileList>
					) : (
						<p className="rounded-lg bg-muted/50 px-3 py-3 text-muted-foreground text-xs">{labels.uploadEmpty}</p>
					)}

					{rejectedFileMessages && rejectedFileMessages.length > 0 ? (
						<div className="mt-2 space-y-1" aria-live="polite" aria-atomic="true">
							{rejectedFileMessages.map((message) => (
								<p key={message} className="text-destructive text-xs">
									{message}
								</p>
							))}
						</div>
					) : null}
				</PromptInputUploadArea>
			) : null}

			<PromptInputInput
				ref={inputRef}
				id={inputId}
				name={inputName}
				autoComplete="off"
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				onFocus={onInitialFocus}
				onSubmit={onSubmit}
				placeholder={placeholder}
				disabled={disableEditingControls}
			/>

			<PromptInputToolbar>
				<PromptInputToolSlot>
					<input
						ref={fileInputRef}
						type="file"
						multiple
						accept={fileAccept}
						className="sr-only"
						onChange={handleFileInputChange}
						tabIndex={-1}
						disabled={disableEditingControls}
					/>
					<Button
						variant="ghost"
						size="icon-sm"
						className="rounded-lg"
						onClick={handleOpenFilePicker}
						aria-label={labels.attachFiles}
						disabled={disableEditingControls}
					>
						<Paperclip aria-hidden="true" />
					</Button>
					{fileCountText ? <span className="text-muted-foreground text-xs">{fileCountText}</span> : null}
					{isStreaming && onStop ? (
						<Button variant="destructive" size="sm" onClick={onStop}>
							{labels.stop}
						</Button>
					) : null}
				</PromptInputToolSlot>

				<PromptInputSubmitSlot>
					<Button size="sm" onClick={onSubmit} disabled={!canSubmit}>
						{isStreaming ? labels.streaming : labels.send}
					</Button>
				</PromptInputSubmitSlot>
			</PromptInputToolbar>
		</PromptInput>
	);
}

export { AppPromptInput };
export type { AppPromptInputLabels, AppPromptInputProps };
