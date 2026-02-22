import type * as React from "react";
import { useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

const DOT_SIZE = 3;
const GAP_X = 40;
const GAP_Y = 32;
const CELL_X = DOT_SIZE + GAP_X;
const CELL_Y = DOT_SIZE + GAP_Y;
const MASK_OFFSCREEN_X = -9999;

const DOT_GRID = `radial-gradient(circle, currentColor ${DOT_SIZE / 2}px, transparent ${DOT_SIZE / 2}px)`;
const GLOW_CENTER = "radial-gradient(circle at 50% 45%, oklch(0.93 0 0 / 0.024) 0%, transparent 70%)";

type AuthBrandPanelProps = {
	className?: string;
};

export function AuthBrandPanel({ className }: AuthBrandPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const panelRectRef = useRef<DOMRect | null>(null);
	const pointerRef = useRef({ x: MASK_OFFSCREEN_X, y: 0 });
	const animationFrameRef = useRef<number | null>(null);
	const { t } = useTranslation("auth");

	const updatePanelRect = useCallback(() => {
		const el = panelRef.current;
		panelRectRef.current = el ? el.getBoundingClientRect() : null;
	}, []);

	const flushPointerPosition = useCallback(() => {
		const el = panelRef.current;
		if (!el) return;
		el.style.setProperty("--mx", `${pointerRef.current.x}px`);
		el.style.setProperty("--my", `${pointerRef.current.y}px`);
		animationFrameRef.current = null;
	}, []);

	const schedulePointerUpdate = useCallback(() => {
		if (animationFrameRef.current !== null) return;
		animationFrameRef.current = window.requestAnimationFrame(flushPointerPosition);
	}, [flushPointerPosition]);

	useEffect(() => {
		updatePanelRect();
		if (typeof ResizeObserver === "undefined") return;
		const el = panelRef.current;
		if (!el) return;
		const observer = new ResizeObserver(updatePanelRect);
		observer.observe(el);
		return () => observer.disconnect();
	}, [updatePanelRect]);

	useEffect(() => {
		return () => {
			if (animationFrameRef.current === null) return;
			window.cancelAnimationFrame(animationFrameRef.current);
		};
	}, []);

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = panelRectRef.current;
			if (!rect) return;
			pointerRef.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
			schedulePointerUpdate();
		},
		[schedulePointerUpdate],
	);

	const handleMouseLeave = useCallback(() => {
		pointerRef.current = { x: MASK_OFFSCREEN_X, y: 0 };
		schedulePointerUpdate();
	}, [schedulePointerUpdate]);

	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: decorative mouse-follow effect
		<div
			ref={panelRef}
			onMouseMove={handleMouseMove}
			onMouseLeave={handleMouseLeave}
			className={cn(
				"fade-in relative hidden h-full shrink-0 animate-in overflow-hidden bg-background duration-500 motion-reduce:animate-none lg:flex lg:w-xl xl:w-2xl 2xl:w-220",
				className,
			)}
			style={{ "--mx": `${MASK_OFFSCREEN_X}px`, "--my": "0px" } as React.CSSProperties}
		>
			<div
				className="absolute inset-0 text-foreground/6"
				style={{
					backgroundImage: `${GLOW_CENTER}, ${DOT_GRID}`,
					backgroundSize: `100% 100%, ${CELL_X}px ${CELL_Y}px`,
				}}
			/>

			<div
				className="pointer-events-none absolute inset-0 text-foreground/30 transition-opacity duration-300"
				style={{
					backgroundImage: DOT_GRID,
					backgroundSize: `${CELL_X}px ${CELL_Y}px`,
					maskImage: "radial-gradient(circle 150px at var(--mx) var(--my), black, transparent)",
					WebkitMaskImage: "radial-gradient(circle 150px at var(--mx) var(--my), black, transparent)",
				}}
			/>

			<div className="relative z-10 flex flex-1 flex-col px-15 pt-20 pb-10 xl:pt-24">
				<div className="flex flex-1 translate-y-5 flex-col items-start justify-start gap-4 text-left">
					<h1 className="font-bold text-[56px] text-foreground tracking-tight">{t("brand.title")}</h1>
					<p className="text-[17px] text-muted-foreground tracking-wide">{t("brand.subtitle")}</p>
				</div>
			</div>
		</div>
	);
}
