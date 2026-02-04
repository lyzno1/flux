import * as z from "zod";

export const emailSearchSchema = z.object({
	email: z.string().email().catch(""),
});

export const optionalEmailSearchSchema = z.object({
	email: z.string().email().optional().catch(undefined),
});
