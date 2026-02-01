export const mockEnv = {
	DATABASE_URL: "postgresql://test:test@localhost:5432/test",
	DB_POOL_MAX: 10,
	DB_POOL_IDLE_TIMEOUT: 30_000,
	BETTER_AUTH_SECRET: "a".repeat(32),
	BETTER_AUTH_URL: "http://localhost:3000",
	CORS_ORIGIN: "http://localhost:3001",
	NODE_ENV: "test" as const,
	DIFY_API_URL: "http://localhost:8080",
	DIFY_API_KEY: "test-dify-api-key",
};
