import { Paperclip, X } from "lucide-react";
import type { ChangeEvent, FocusEventHandler, Ref } from "react";
import { useCallback, useRef } from "react";
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
import { promptInputSelectors } from "@/stores/app/slices/prompt-input/selectors";
import { useAppStore } from "@/stores/app/store";

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
	autoFocus?: boolean;
	attachments: PromptInputAttachment[];
	canSubmit: boolean;
	disabled?: boolean;
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
	streaming?: boolean;
	value: string;
};

function AppPromptInput({
	autoFocus,
	attachments,
	canSubmit,
	disabled,
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
	streaming,
	value,
}: AppPromptInputProps) {
	const uploadAreaOpen = useAppStore(promptInputSelectors.isPromptUploadAreaOpen);
	const setUploadAreaOpen = useAppStore((s) => s.setPromptUploadAreaOpen);
	const fileInputRef = useRef<HTMLInputElement | null>(null);

	const handleOpenFilePicker = useCallback(() => {
		setUploadAreaOpen(true);
		fileInputRef.current?.click();
	}, [setUploadAreaOpen]);

	const handleFileInputChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const selectedFiles = event.currentTarget.files;
			if (selectedFiles && selectedFiles.length > 0) {
				onSelectFiles(selectedFiles);
				setUploadAreaOpen(true);
			}
			event.currentTarget.value = "";
		},
		[onSelectFiles, setUploadAreaOpen],
	);

	const handleClearFiles = useCallback(() => {
		onClearFiles();
		setUploadAreaOpen(false);
	}, [onClearFiles, setUploadAreaOpen]);

	return (
		<PromptInput disabled={disabled}>
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
						>
							<X aria-hidden="true" />
						</Button>
					</div>

					{attachments.length > 0 ? (
						<PromptInputFileList>
							{attachments.map((attachment) => (
								<PromptInputFileItem
									key={attachment.id}
									attachment={attachment}
									onRemove={onRemoveAttachment}
									removeLabel={labels.removeFile}
									uploadingLabel={labels.fileUploading}
									uploadedLabel={labels.fileUploaded}
									errorLabel={labels.fileUploadFailed}
								/>
							))}
						</PromptInputFileList>
					) : (
						<p className="rounded-lg bg-muted/50 px-3 py-3 text-muted-foreground text-xs">{labels.uploadEmpty}</p>
					)}

					{rejectedFileMessages && rejectedFileMessages.length > 0 ? (
						<div className="mt-2 space-y-1">
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
				autoFocus={autoFocus}
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
				onFocus={onInitialFocus}
				onSubmit={onSubmit}
				placeholder={placeholder}
				disabled={disabled}
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
					/>
					<Button
						variant="ghost"
						size="icon-sm"
						className="rounded-lg"
						onClick={handleOpenFilePicker}
						aria-label={labels.attachFiles}
						disabled={disabled}
					>
						<Paperclip aria-hidden="true" />
					</Button>
					{fileCountText ? <span className="text-muted-foreground text-xs">{fileCountText}</span> : null}
					{streaming && onStop ? (
						<Button variant="destructive" size="sm" onClick={onStop}>
							{labels.stop}
						</Button>
					) : null}
				</PromptInputToolSlot>

				<PromptInputSubmitSlot>
					<Button size="sm" onClick={onSubmit} disabled={!canSubmit}>
						{streaming ? labels.streaming : labels.send}
					</Button>
				</PromptInputSubmitSlot>
			</PromptInputToolbar>
		</PromptInput>
	);
}

export { AppPromptInput };
export type { AppPromptInputLabels, AppPromptInputProps };
