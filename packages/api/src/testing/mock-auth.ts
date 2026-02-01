import type { Mock } from "vitest";
import { vi } from "vitest";

export const mockGetSession: Mock = vi.fn();

export const mockAuth: { api: { getSession: Mock } } = {
	api: {
		getSession: mockGetSession,
	},
};
