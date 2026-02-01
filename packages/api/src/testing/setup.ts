import type { Context } from "../context";

export function createTestContext(init?: ConstructorParameters<typeof Headers>[0]): Context {
	return { headers: new Headers(init) };
}

interface MockUser {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export function createMockUser(overrides?: Partial<MockUser>): MockUser {
	return {
		id: "user-1",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		image: null,
		createdAt: new Date("2025-01-01"),
		updatedAt: new Date("2025-01-01"),
		...overrides,
	};
}

export function createMockSession(overrides?: { user?: Partial<MockUser>; session?: Record<string, unknown> }) {
	return {
		user: createMockUser(overrides?.user),
		session: {
			id: "session-1",
			userId: "user-1",
			token: "test-token",
			expiresAt: new Date("2099-01-01"),
			createdAt: new Date("2025-01-01"),
			updatedAt: new Date("2025-01-01"),
			ipAddress: null,
			userAgent: null,
			...overrides?.session,
		},
	};
}
