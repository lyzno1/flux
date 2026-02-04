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
		<div className="mx-auto mt-10 w-full max-w-md p-6">
			<h1 className="mb-6 text-pretty text-center font-bold text-3xl">{title}</h1>
			{description ? <p className="mb-6 text-center text-muted-foreground text-sm">{description}</p> : null}
			{children}
			{footer ? <div className="mt-4 text-center">{footer}</div> : null}
		</div>
	);
}
