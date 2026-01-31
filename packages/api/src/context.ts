export function createContext(headers: Headers) {
	return { headers };
}

export type Context = ReturnType<typeof createContext>;
