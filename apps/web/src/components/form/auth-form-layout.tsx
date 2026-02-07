import type * as React from "react";

export function AuthFormLayout({
	title,
	description,
	children,
	footer,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	footer?: React.ReactNode;
}) {
	return (
		<div className="flex min-h-full items-center justify-center bg-surface-1 px-6 py-12 lg:px-10 lg:py-14 xl:px-18 xl:py-15">
			<div className="w-full max-w-md space-y-8">
				<div className="space-y-2">
					<h1 className="font-semibold text-3xl tracking-tight">{title}</h1>
					{description ? <p className="text-muted-foreground text-sm">{description}</p> : null}
				</div>
				{children}
				{footer ? <div className="text-center">{footer}</div> : null}
			</div>
		</div>
	);
}
