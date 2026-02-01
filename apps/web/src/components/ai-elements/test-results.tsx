import { CheckCircle2Icon, ChevronRightIcon, CircleDotIcon, CircleIcon, XCircleIcon } from "lucide-react";
import { type ComponentProps, createContext, type HTMLAttributes, useContext } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

type TestStatus = "passed" | "failed" | "skipped" | "running";

interface TestResultsSummary {
	passed: number;
	failed: number;
	skipped: number;
	total: number;
	duration?: number;
}

interface TestResultsContextType {
	summary?: TestResultsSummary;
}

const TestResultsContext = createContext<TestResultsContextType>({});

export type TestResultsProps = HTMLAttributes<HTMLDivElement> & {
	summary?: TestResultsSummary;
};

export const TestResults = ({ summary, className, children, ...props }: TestResultsProps) => (
	<TestResultsContext.Provider value={{ summary }}>
		<div className={cn("rounded-lg border bg-background", className)} {...props}>
			{children ??
				(summary && (
					<TestResultsHeader>
						<TestResultsSummary />
						<TestResultsDuration />
					</TestResultsHeader>
				))}
		</div>
	</TestResultsContext.Provider>
);

export type TestResultsHeaderProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsHeader = ({ className, children, ...props }: TestResultsHeaderProps) => (
	<div className={cn("flex items-center justify-between border-b px-4 py-3", className)} {...props}>
		{children}
	</div>
);

export type TestResultsSummaryProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsSummary = ({ className, children, ...props }: TestResultsSummaryProps) => {
	const { summary } = useContext(TestResultsContext);
	const { t } = useTranslation("ai");

	if (!summary) {
		return null;
	}

	return (
		<div className={cn("flex items-center gap-3", className)} {...props}>
			{children ?? (
				<>
					<Badge className="gap-1 bg-success-muted text-success-foreground" variant="secondary">
						<CheckCircle2Icon aria-hidden="true" className="size-3" />
						{t("testResults.passed", { count: summary.passed })}
					</Badge>
					{summary.failed > 0 && (
						<Badge className="gap-1 bg-destructive/10 text-destructive" variant="secondary">
							<XCircleIcon aria-hidden="true" className="size-3" />
							{t("testResults.failed", { count: summary.failed })}
						</Badge>
					)}
					{summary.skipped > 0 && (
						<Badge className="gap-1 bg-warning-muted text-warning-foreground" variant="secondary">
							<CircleIcon aria-hidden="true" className="size-3" />
							{t("testResults.skipped", { count: summary.skipped })}
						</Badge>
					)}
				</>
			)}
		</div>
	);
};

export type TestResultsDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestResultsDuration = ({ className, children, ...props }: TestResultsDurationProps) => {
	const { summary } = useContext(TestResultsContext);

	if (!summary?.duration) {
		return null;
	}

	const formatted =
		summary.duration < 1000
			? `${new Intl.NumberFormat("en-US").format(summary.duration)}ms`
			: `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(summary.duration / 1000)}s`;

	return (
		<span className={cn("text-muted-foreground text-sm", className)} {...props}>
			{children ?? formatted}
		</span>
	);
};

export type TestResultsProgressProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsProgress = ({ className, children, ...props }: TestResultsProgressProps) => {
	const { summary } = useContext(TestResultsContext);
	const { t } = useTranslation("ai");

	if (!summary) {
		return null;
	}

	const passedPercent = (summary.passed / summary.total) * 100;
	const failedPercent = (summary.failed / summary.total) * 100;

	return (
		<div className={cn("space-y-2", className)} {...props}>
			{children ?? (
				<>
					<div className="flex h-2 overflow-hidden rounded-full bg-muted">
						<div className="bg-success" style={{ width: `${passedPercent}%` }} />
						<div className="bg-destructive" style={{ width: `${failedPercent}%` }} />
					</div>
					<div className="flex justify-between text-muted-foreground text-xs">
						<span>{t("testResults.testsPassed", { passed: summary.passed, total: summary.total })}</span>
						<span>{passedPercent.toFixed(0)}%</span>
					</div>
				</>
			)}
		</div>
	);
};

export type TestResultsContentProps = HTMLAttributes<HTMLDivElement>;

export const TestResultsContent = ({ className, children, ...props }: TestResultsContentProps) => (
	<div className={cn("space-y-2 p-4", className)} {...props}>
		{children}
	</div>
);

interface TestSuiteContextType {
	name: string;
	status: TestStatus;
}

const TestSuiteContext = createContext<TestSuiteContextType>({
	name: "",
	status: "passed",
});

export type TestSuiteProps = ComponentProps<typeof Collapsible> & {
	name: string;
	status: TestStatus;
};

export const TestSuite = ({ name, status, className, children, ...props }: TestSuiteProps) => (
	<TestSuiteContext.Provider value={{ name, status }}>
		<Collapsible className={cn("rounded-lg border", className)} {...props}>
			{children}
		</Collapsible>
	</TestSuiteContext.Provider>
);

export type TestSuiteNameProps = ComponentProps<typeof CollapsibleTrigger>;

export const TestSuiteName = ({ className, children, ...props }: TestSuiteNameProps) => {
	const { name, status } = useContext(TestSuiteContext);

	return (
		<CollapsibleTrigger
			className={cn(
				"group flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-muted/50",
				className,
			)}
			{...props}
		>
			<ChevronRightIcon
				aria-hidden="true"
				className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90"
			/>
			<TestStatusIcon status={status} />
			<span className="font-medium text-sm">{children ?? name}</span>
		</CollapsibleTrigger>
	);
};

export type TestSuiteStatsProps = HTMLAttributes<HTMLDivElement> & {
	passed?: number;
	failed?: number;
	skipped?: number;
};

export const TestSuiteStats = ({
	passed = 0,
	failed = 0,
	skipped = 0,
	className,
	children,
	...props
}: TestSuiteStatsProps) => {
	const { t } = useTranslation("ai");

	return (
		<div className={cn("ml-auto flex items-center gap-2 text-xs", className)} {...props}>
			{children ?? (
				<>
					{passed > 0 && <span className="text-success-foreground">{t("testResults.passed", { count: passed })}</span>}
					{failed > 0 && <span className="text-destructive">{t("testResults.failed", { count: failed })}</span>}
					{skipped > 0 && (
						<span className="text-warning-foreground">{t("testResults.skipped", { count: skipped })}</span>
					)}
				</>
			)}
		</div>
	);
};

export type TestSuiteContentProps = ComponentProps<typeof CollapsibleContent>;

export const TestSuiteContent = ({ className, children, ...props }: TestSuiteContentProps) => (
	<CollapsibleContent className={cn("border-t", className)} {...props}>
		<div className="divide-y">{children}</div>
	</CollapsibleContent>
);

interface TestContextType {
	name: string;
	status: TestStatus;
	duration?: number;
}

const TestContext = createContext<TestContextType>({
	name: "",
	status: "passed",
});

export type TestProps = HTMLAttributes<HTMLDivElement> & {
	name: string;
	status: TestStatus;
	duration?: number;
};

export const Test = ({ name, status, duration, className, children, ...props }: TestProps) => (
	<TestContext.Provider value={{ name, status, duration }}>
		<div className={cn("flex items-center gap-2 px-4 py-2 text-sm", className)} {...props}>
			{children ?? (
				<>
					<TestStatus />
					<TestName />
					{duration !== undefined && <TestDuration />}
				</>
			)}
		</div>
	</TestContext.Provider>
);

const statusStyles: Record<TestStatus, string> = {
	passed: "text-success-foreground",
	failed: "text-destructive",
	skipped: "text-warning-foreground",
	running: "text-info-foreground",
};

const statusLabels: Record<TestStatus, string> = {
	passed: "Passed",
	failed: "Failed",
	skipped: "Skipped",
	running: "Running",
};

const statusIcons: Record<TestStatus, React.ReactNode> = {
	passed: <CheckCircle2Icon aria-hidden="true" className="size-4" />,
	failed: <XCircleIcon aria-hidden="true" className="size-4" />,
	skipped: <CircleIcon aria-hidden="true" className="size-4" />,
	running: <CircleDotIcon aria-hidden="true" className="size-4 animate-pulse motion-reduce:animate-none" />,
};

const TestStatusIcon = ({ status }: { status: TestStatus }) => (
	<span className={cn("shrink-0", statusStyles[status])}>
		{statusIcons[status]}
		<span className="sr-only">{statusLabels[status]}</span>
	</span>
);

export type TestStatusProps = HTMLAttributes<HTMLSpanElement>;

export const TestStatus = ({ className, children, ...props }: TestStatusProps) => {
	const { status } = useContext(TestContext);
	const showFallback = children == null;

	return (
		<span className={cn("shrink-0", statusStyles[status], className)} {...props}>
			{children ?? statusIcons[status]}
			{showFallback && <span className="sr-only">{statusLabels[status]}</span>}
		</span>
	);
};

export type TestNameProps = HTMLAttributes<HTMLSpanElement>;

export const TestName = ({ className, children, ...props }: TestNameProps) => {
	const { name } = useContext(TestContext);

	return (
		<span className={cn("flex-1", className)} {...props}>
			{children ?? name}
		</span>
	);
};

export type TestDurationProps = HTMLAttributes<HTMLSpanElement>;

export const TestDuration = ({ className, children, ...props }: TestDurationProps) => {
	const { duration } = useContext(TestContext);

	if (duration === undefined) {
		return null;
	}

	return (
		<span className={cn("ml-auto text-muted-foreground text-xs", className)} {...props}>
			{children ?? `${duration}ms`}
		</span>
	);
};

export type TestErrorProps = HTMLAttributes<HTMLDivElement>;

export const TestError = ({ className, children, ...props }: TestErrorProps) => (
	<div className={cn("mt-2 rounded-md bg-destructive/10 p-3", className)} {...props}>
		{children}
	</div>
);

export type TestErrorMessageProps = HTMLAttributes<HTMLParagraphElement>;

export const TestErrorMessage = ({ className, children, ...props }: TestErrorMessageProps) => (
	<p className={cn("font-medium text-destructive text-sm", className)} {...props}>
		{children}
	</p>
);

export type TestErrorStackProps = HTMLAttributes<HTMLPreElement>;

export const TestErrorStack = ({ className, children, ...props }: TestErrorStackProps) => (
	<pre className={cn("mt-2 overflow-auto font-mono text-destructive text-xs", className)} {...props}>
		{children}
	</pre>
);
