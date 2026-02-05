import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { client } from "@/utils/orpc";

export const Route = createFileRoute("/_authenticated/dify")({
	component: DifyDemo,
});

interface StreamEntry {
	event: string;
	data: unknown;
	receivedAt: number;
}

const EVENT_COLORS: Record<string, string> = {
	message: "bg-info-muted text-info-foreground",
	agent_message: "bg-info-muted text-info-foreground",
	agent_thought: "bg-muted text-muted-foreground",
	message_end: "bg-success-muted text-success-foreground",
	message_file: "bg-warning-muted text-warning-foreground",
	message_replace: "bg-warning-muted text-warning-foreground",
	workflow_started: "bg-info-muted text-info-foreground",
	workflow_finished: "bg-success-muted text-success-foreground",
	node_started: "bg-info-muted text-info-foreground",
	node_finished: "bg-success-muted text-success-foreground",
	node_retry: "bg-warning-muted text-warning-foreground",
	error: "bg-destructive-muted text-destructive",
	ping: "bg-muted text-muted-foreground",
	text_chunk: "bg-info-muted text-info-foreground",
	agent_log: "bg-muted text-muted-foreground",
};

function EventBadge({ event }: { event: string }) {
	return (
		<span
			className={cn(
				"inline-block rounded px-1.5 py-0.5 font-mono text-xs",
				EVENT_COLORS[event] ?? "bg-muted text-muted-foreground",
			)}
		>
			{event}
		</span>
	);
}

interface StreamCallbacks {
	onEvent: (entry: StreamEntry) => void;
	onAnswer: (chunk: string) => void;
	onConversationId: (id: string) => void;
}

async function consumeStream(
	iterator: AsyncIterableIterator<{ event: string; [key: string]: unknown }>,
	start: number,
	callbacks: StreamCallbacks,
) {
	for await (const event of iterator) {
		callbacks.onEvent({ event: event.event, data: event, receivedAt: performance.now() - start });

		if ((event.event === "message" || event.event === "agent_message") && "answer" in event) {
			callbacks.onAnswer(event.answer as string);
		}

		if (event.event === "message_end" && "conversation_id" in event) {
			callbacks.onConversationId(event.conversation_id as string);
		}
	}
}

function DifyDemo() {
	const { t } = useTranslation("dify");
	const id = useId();
	const [query, setQuery] = useState("hello");
	const [conversationId, setConversationId] = useState("");

	const [entries, setEntries] = useState<StreamEntry[]>([]);
	const [answer, setAnswer] = useState("");
	const [streaming, setStreaming] = useState(false);
	const [elapsed, setElapsed] = useState<number | null>(null);
	const abortRef = useRef<AbortController | null>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = useCallback(() => {
		requestAnimationFrame(() => {
			scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
		});
	}, []);

	const handleStream = useCallback(async () => {
		setEntries([]);
		setAnswer("");
		setElapsed(null);
		setStreaming(true);

		const controller = new AbortController();
		abortRef.current = controller;
		const start = performance.now();

		try {
			const iterator = await client.dify.chatMessagesStream(
				{
					query,
					inputs: {},
					...(conversationId ? { conversation_id: conversationId } : {}),
				},
				{ signal: controller.signal },
			);

			await consumeStream(iterator, start, {
				onEvent: (entry) => {
					setEntries((prev) => [...prev, entry]);
					scrollToBottom();
				},
				onAnswer: (chunk) => setAnswer((prev) => prev + chunk),
				onConversationId: setConversationId,
			});
		} catch (err) {
			if (!(err instanceof DOMException && err.name === "AbortError")) {
				setEntries((prev) => [
					...prev,
					{ event: "client_error", data: { message: (err as Error).message }, receivedAt: performance.now() - start },
				]);
			}
		} finally {
			setElapsed(performance.now() - start);
			setStreaming(false);
			abortRef.current = null;
			scrollToBottom();
		}
	}, [query, conversationId, scrollToBottom]);

	const handleStop = useCallback(() => {
		abortRef.current?.abort();
	}, []);

	const queryId = `${id}-query`;
	const convId = `${id}-conv`;

	return (
		<div className="grid h-full grid-cols-[320px_1fr] gap-0 overflow-hidden">
			<div className="flex flex-col gap-4 overflow-y-auto border-r p-4">
				<h2 className="font-bold text-lg">{t("title")}</h2>

				<div className="flex flex-col gap-3">
					<div className="flex flex-col gap-1.5">
						<Label htmlFor={queryId}>{t("query")}</Label>
						<Input id={queryId} value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
					</div>

					<div className="flex flex-col gap-1.5">
						<Label htmlFor={convId}>{t("conversationId")}</Label>
						<Input
							id={convId}
							value={conversationId}
							onChange={(e) => setConversationId(e.currentTarget.value)}
							placeholder={t("conversationIdPlaceholder")}
						/>
					</div>
				</div>

				<div className="flex gap-2">
					<Button onClick={handleStream} disabled={streaming || !query.trim()}>
						{streaming ? t("streaming") : t("send")}
					</Button>
					{streaming && (
						<Button variant="destructive" onClick={handleStop}>
							{t("stop")}
						</Button>
					)}
				</div>

				{answer && (
					<Card>
						<CardHeader>
							<CardTitle>{t("answer")}</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="whitespace-pre-wrap text-sm">{answer}</p>
						</CardContent>
						{elapsed !== null && (
							<CardFooter>
								<span className="text-muted-foreground text-xs">{t("elapsedShort", { val: elapsed })}</span>
							</CardFooter>
						)}
					</Card>
				)}

				{entries.length > 0 && (
					<div className="text-muted-foreground text-xs">
						{t("eventsCount", { count: entries.filter((e) => e.event !== "ping").length })}
						{elapsed !== null && <> {t("elapsed", { val: elapsed })}</>}
					</div>
				)}
			</div>

			<div ref={scrollRef} className="overflow-y-auto p-4">
				<div className="flex flex-col gap-1">
					{entries.length === 0 && <p className="py-8 text-center text-muted-foreground text-sm">{t("emptyState")}</p>}
					{entries.map((entry, i) => (
						<div
							key={`${entry.receivedAt}-${i}`}
							className="flex items-start gap-2 rounded border p-2 font-mono text-xs"
						>
							<span className="w-20 shrink-0 text-right text-muted-foreground">
								{t("eventTimestamp", { val: entry.receivedAt })}
							</span>
							<EventBadge event={entry.event} />
							<pre className="min-w-0 flex-1 overflow-x-auto whitespace-pre-wrap break-all">
								{JSON.stringify(entry.data, null, 2)}
							</pre>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
