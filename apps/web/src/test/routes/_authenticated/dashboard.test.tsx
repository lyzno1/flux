import { screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { renderWithFileRoutes } from "@/test/file-route-utils";
import { createMockContext, createMockQueryClient, createMockSession } from "@/test/mock-context";

vi.mock("@/lib/auth-client", () => ({
	authClient: {
		useSession: vi.fn(() => ({ data: null, isPending: false, error: null })),
		signIn: { email: vi.fn(), username: vi.fn(), social: vi.fn() },
		signUp: { email: vi.fn() },
		emailOtp: { sendVerificationOtp: vi.fn() },
		forgetPassword: vi.fn(),
		resetPassword: vi.fn(),
	},
}));

vi.mock("@/utils/orpc", () => ({
	orpc: {
		healthCheck: {
			queryOptions: () => ({ queryKey: ["healthCheck"], queryFn: async () => "OK" }),
		},
		privateData: {
			queryOptions: () => ({ queryKey: ["privateData"], queryFn: async () => ({ message: "mock private data" }) }),
		},
	},
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() }, Toaster: () => null }));
vi.mock("@/components/header", () => ({ Header: () => <div data-testid="header">Header</div> }));
vi.mock("@/components/devtools/loader", () => ({ DevtoolsLoader: () => null }));
vi.mock("@/components/google-one-tap", () => ({ GoogleOneTap: () => null }));

afterEach(() => {
	vi.clearAllMocks();
});

describe("Dashboard Route (file-based)", () => {
	it("renders dashboard with authenticated user", async () => {
		const mockSession = createMockSession({
			user: {
				id: "1",
				name: "Alice",
				email: "alice@example.com",
				emailVerified: true,
				createdAt: new Date(),
				updatedAt: new Date(),
			},
		});

		const queryClient = createMockQueryClient();
		queryClient.setQueryData(["privateData"], { message: "hello from api" });

		const { authClient } = await import("@/lib/auth-client");
		vi.mocked(authClient.useSession).mockReturnValue({
			data: mockSession,
			isPending: false,
			error: null,
		} as ReturnType<typeof authClient.useSession>);

		renderWithFileRoutes({
			initialLocation: "/dashboard",
			routerContext: createMockContext({ authenticated: true, session: mockSession, queryClient }),
		});

		await waitFor(() => {
			expect(screen.getByText("title")).toBeInTheDocument();
		});
	});

	it("redirects unauthenticated user to login", async () => {
		const { authClient } = await import("@/lib/auth-client");
		vi.mocked(authClient.useSession).mockReturnValue({
			data: null,
			isPending: false,
			error: null,
		} as ReturnType<typeof authClient.useSession>);

		const { router } = renderWithFileRoutes({
			initialLocation: "/dashboard",
			routerContext: createMockContext({ authenticated: false }),
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
		});
	});

	it("preserves redirect param when redirecting to login", async () => {
		const { authClient } = await import("@/lib/auth-client");
		vi.mocked(authClient.useSession).mockReturnValue({
			data: null,
			isPending: false,
			error: null,
		} as ReturnType<typeof authClient.useSession>);

		const { router } = renderWithFileRoutes({
			initialLocation: "/dashboard",
			routerContext: createMockContext({ authenticated: false }),
		});

		await waitFor(() => {
			expect(router.state.location.pathname).toBe("/login");
			expect(router.state.location.search).toMatchObject({
				redirect: expect.stringContaining("/dashboard"),
			});
		});
	});
});
