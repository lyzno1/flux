import { QueryClient } from "@tanstack/react-query";
import type { RouterAppContext } from "@/routes/__root";

export function createMockQueryClient(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: { retry: false, staleTime: 0 },
			mutations: { retry: false },
		},
	});
}

interface MockSessionData {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified: boolean;
		createdAt: Date;
		updatedAt: Date;
		image?: string | null;
		username?: string | null;
	};
	session: {
		id: string;
		token: string;
		expiresAt: Date;
		userId: string;
		createdAt: Date;
		updatedAt: Date;
	};
}

const DEFAULT_SESSION: MockSessionData = {
	user: {
		id: "test-user-id",
		name: "Test User",
		email: "test@example.com",
		emailVerified: true,
		createdAt: new Date("2025-01-01"),
		updatedAt: new Date("2025-01-01"),
	},
	session: {
		id: "test-session-id",
		token: "mock-session-token",
		expiresAt: new Date(Date.now() + 86_400_000),
		userId: "test-user-id",
		createdAt: new Date("2025-01-01"),
		updatedAt: new Date("2025-01-01"),
	},
};

export function createMockSession(overrides?: Partial<MockSessionData>): MockSessionData {
	return {
		user: { ...DEFAULT_SESSION.user, ...overrides?.user },
		session: { ...DEFAULT_SESSION.session, ...overrides?.session },
	};
}

interface CreateMockContextOptions {
	authenticated?: boolean;
	session?: Partial<MockSessionData>;
	queryClient?: QueryClient;
}

export function createMockContext(options: CreateMockContextOptions = {}): RouterAppContext {
	const { authenticated = false, session, queryClient } = options;

	const mockQueryClient = queryClient ?? createMockQueryClient();

	const mockAuth = {
		data: authenticated ? createMockSession(session) : null,
		isPending: false,
		error: null,
	} as RouterAppContext["auth"];

	return {
		orpc: {} as RouterAppContext["orpc"],
		queryClient: mockQueryClient,
		auth: mockAuth,
	};
}
