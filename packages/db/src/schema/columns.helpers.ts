import { timestamp } from "drizzle-orm/pg-core";

export const timestamptz = (name: string) => timestamp(name, { withTimezone: true });

export const timestamps = {
	createdAt: timestamptz("created_at").defaultNow().notNull(),
	updatedAt: timestamptz("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
};
