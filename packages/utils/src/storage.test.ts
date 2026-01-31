// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let storage: typeof import("./storage").storage;

const localStorageMap = new Map<string, string>();

const localStorageMock = {
	getItem: vi.fn((key: string) => localStorageMap.get(key) ?? null),
	setItem: vi.fn((key: string, value: string) => localStorageMap.set(key, value)),
	removeItem: vi.fn((key: string) => localStorageMap.delete(key)),
};

function key(k: string) {
	return `v1:${k}`;
}

beforeEach(async () => {
	vi.stubGlobal("localStorage", localStorageMock);
	localStorageMap.clear();
	vi.resetModules();
	const mod = await import("./storage");
	storage = mod.storage;
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("storage.isAvailable", () => {
	it("returns true when localStorage works", () => {
		expect(storage.isAvailable()).toBe(true);
	});

	it("returns false when setItem throws", async () => {
		vi.unstubAllGlobals();
		vi.stubGlobal("localStorage", {
			setItem: () => {
				throw new Error("quota exceeded");
			},
			removeItem: vi.fn(),
		});

		vi.resetModules();
		const mod = await import("./storage");
		expect(mod.storage.isAvailable()).toBe(false);
	});

	it("caches the result across calls", () => {
		storage.isAvailable();
		storage.isAvailable();
		expect(localStorageMock.setItem).toHaveBeenCalledTimes(1);
	});

	it("re-checks after resetCache", () => {
		storage.isAvailable();
		storage.resetCache();
		storage.isAvailable();
		expect(localStorageMock.setItem).toHaveBeenCalledTimes(2);
	});
});

describe("storage.get", () => {
	it("returns null for missing key", () => {
		expect(storage.get("missing")).toBeNull();
	});

	it("returns defaultValue for missing key", () => {
		expect(storage.get("missing", "fallback")).toBe("fallback");
	});

	it("reads a JSON object", () => {
		localStorageMap.set(key("obj"), JSON.stringify({ a: 1 }));
		expect(storage.get("obj")).toEqual({ a: 1 });
	});

	it("reads a JSON array", () => {
		localStorageMap.set(key("arr"), JSON.stringify([1, 2, 3]));
		expect(storage.get("arr")).toEqual([1, 2, 3]);
	});

	it("falls back to raw string when JSON.parse fails", () => {
		localStorageMap.set(key("str"), "hello world");
		expect(storage.get("str")).toBe("hello world");
	});

	it("reads a JSON number", () => {
		localStorageMap.set(key("num"), "42");
		expect(storage.get("num")).toBe(42);
	});

	it("reads a JSON boolean", () => {
		localStorageMap.set(key("bool"), "true");
		expect(storage.get("bool")).toBe(true);
	});

	it("reads JSON null", () => {
		localStorageMap.set(key("n"), "null");
		expect(storage.get("n")).toBeNull();
	});

	it("returns defaultValue when localStorage throws", () => {
		localStorageMock.getItem.mockImplementationOnce(() => {
			throw new Error("access denied");
		});
		expect(storage.get("x", "safe")).toBe("safe");
	});
});

describe("storage.set", () => {
	it("stores a string value directly", () => {
		storage.set("name", "alice");
		expect(localStorageMap.get(key("name"))).toBe("alice");
	});

	it("serializes a non-string value as JSON", () => {
		storage.set("data", { x: 1 });
		expect(localStorageMap.get(key("data"))).toBe('{"x":1}');
	});

	it("serializes a number", () => {
		storage.set("count", 99);
		expect(localStorageMap.get(key("count"))).toBe("99");
	});

	it("serializes a boolean", () => {
		storage.set("flag", true);
		expect(localStorageMap.get(key("flag"))).toBe("true");
	});

	it("silently ignores errors", () => {
		localStorageMock.setItem.mockImplementationOnce(() => {
			throw new Error("quota exceeded");
		});
		expect(() => storage.set("x", "y")).not.toThrow();
	});
});

describe("storage.remove", () => {
	it("removes a versioned key", () => {
		localStorageMap.set(key("item"), "value");
		storage.remove("item");
		expect(localStorageMap.has(key("item"))).toBe(false);
	});

	it("silently ignores errors", () => {
		localStorageMock.removeItem.mockImplementationOnce(() => {
			throw new Error("access denied");
		});
		expect(() => storage.remove("x")).not.toThrow();
	});
});

describe("storage.getNumber", () => {
	it("parses a stored number string", () => {
		storage.set("n", "3.14");
		expect(storage.getNumber("n")).toBe(3.14);
	});

	it("returns a stored JSON number directly", () => {
		storage.set("n", 42);
		expect(storage.getNumber("n")).toBe(42);
	});

	it("returns null for missing key", () => {
		expect(storage.getNumber("missing")).toBeNull();
	});

	it("returns defaultValue for missing key", () => {
		expect(storage.getNumber("missing", 0)).toBe(0);
	});

	it("returns defaultValue for NaN", () => {
		storage.set("bad", "not-a-number");
		expect(storage.getNumber("bad", -1)).toBe(-1);
	});

	it("returns null for NaN without default", () => {
		storage.set("bad", "abc");
		expect(storage.getNumber("bad")).toBeNull();
	});
});

describe("storage.getBoolean", () => {
	it("returns true for JSON-serialized boolean true", () => {
		storage.set("flag", true);
		expect(storage.getBoolean("flag")).toBe(true);
	});

	it('parses raw string "true" from localStorage', () => {
		localStorageMap.set(key("flag"), "true");
		expect(storage.getBoolean("flag")).toBe(true);
	});

	it('parses raw string "false" from localStorage', () => {
		localStorageMap.set(key("flag"), "false");
		expect(storage.getBoolean("flag")).toBe(false);
	});

	it("returns null for missing key", () => {
		expect(storage.getBoolean("missing")).toBeNull();
	});

	it("returns defaultValue for missing key", () => {
		expect(storage.getBoolean("missing", false)).toBe(false);
	});

	it("treats arbitrary string as false", () => {
		storage.set("flag", "yes");
		expect(storage.getBoolean("flag")).toBe(false);
	});
});

describe("storage.resetCache", () => {
	it("allows re-evaluation of availability", () => {
		expect(storage.isAvailable()).toBe(true);

		vi.unstubAllGlobals();
		vi.stubGlobal("localStorage", {
			setItem: () => {
				throw new Error("disabled");
			},
			removeItem: vi.fn(),
		});

		expect(storage.isAvailable()).toBe(true);

		storage.resetCache();
		expect(storage.isAvailable()).toBe(false);
	});
});

describe("versioned key", () => {
	it("prefixes keys with v1:", () => {
		storage.set("test", "value");
		expect(localStorageMock.setItem).toHaveBeenCalledWith("v1:test", "value");
	});

	it("reads from versioned key", () => {
		localStorageMap.set("v1:test", '"versioned"');
		expect(storage.get("test")).toBe("versioned");
	});

	it("does not read unversioned keys", () => {
		localStorageMap.set("test", '"old"');
		expect(storage.get("test")).toBeNull();
	});
});
