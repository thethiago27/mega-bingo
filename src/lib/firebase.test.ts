import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock Firebase modules
vi.mock("firebase/app", () => ({
  initializeApp: vi.fn(() => ({ name: "[DEFAULT]" })),
  getApps: vi.fn(() => []),
  FirebaseApp: vi.fn(),
}));

vi.mock("firebase/database", () => ({
  getDatabase: vi.fn(() => ({ type: "database" })),
  Database: vi.fn(),
}));

vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ type: "auth" })),
  Auth: vi.fn(),
}));

describe("firebase.ts", () => {
  const originalWindow = global.window;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    global.window = originalWindow;
    process.env = originalEnv;
  });

  describe("Browser Environment with Valid Config", () => {
    it("should initialize Firebase when in browser with valid config", async () => {
      // Setup browser environment
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456:web:abc",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { getApps } = await import("firebase/app");

      vi.mocked(getApps).mockReturnValue([]);

      const firebase = await import("./firebase");

      expect(firebase.app).toBeDefined();
      expect(firebase.db).toBeDefined();
      expect(firebase.auth).toBeDefined();
    });

    it("should reuse existing Firebase app if already initialized", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const existingApp = { name: "[DEFAULT]" };
      const { getApps } = await import("firebase/app");
      vi.mocked(getApps).mockReturnValue([existingApp] as never);

      const firebase = await import("./firebase");

      expect(firebase.app).toBeDefined();
    });
  });

  describe("SSR/SSG Environment", () => {
    it("should not initialize Firebase during SSR (no window)", async () => {
      // Remove window object
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { initializeApp } = await import("firebase/app");

      await import("./firebase");

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it("should export undefined values during SSR", async () => {
      Object.defineProperty(global, "window", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const firebase = await import("./firebase");

      expect(firebase.app).toBeUndefined();
      expect(firebase.db).toBeUndefined();
      expect(firebase.auth).toBeUndefined();
    });
  });

  describe("Missing Environment Variables", () => {
    it("should not initialize when API key is missing", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { initializeApp } = await import("firebase/app");

      await import("./firebase");

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it("should not initialize when project ID is missing", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: undefined,
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { initializeApp } = await import("firebase/app");

      await import("./firebase");

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it("should not initialize when database URL is missing", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: undefined,
      };

      const { initializeApp } = await import("firebase/app");

      await import("./firebase");

      expect(initializeApp).not.toHaveBeenCalled();
    });

    it("should export undefined when config is incomplete", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: undefined,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const firebase = await import("./firebase");

      expect(firebase.app).toBeUndefined();
      expect(firebase.db).toBeUndefined();
      expect(firebase.auth).toBeUndefined();
    });
  });

  describe("Firebase Configuration", () => {
    it("should use all environment variables in config", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      const testConfig = {
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "test.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "test.appspot.com",
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456",
        NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456:web:abc",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      process.env = {
        ...originalEnv,
        ...testConfig,
      };

      const { initializeApp, getApps } = await import("firebase/app");
      vi.mocked(getApps).mockReturnValue([]);

      await import("./firebase");

      expect(initializeApp).toHaveBeenCalledWith({
        apiKey: testConfig.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: testConfig.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: testConfig.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: testConfig.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: testConfig.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: testConfig.NEXT_PUBLIC_FIREBASE_APP_ID,
        databaseURL: testConfig.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
      });
    });
  });

  describe("Service Initialization", () => {
    it("should initialize database service when app is initialized", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { getApps } = await import("firebase/app");
      const { getDatabase } = await import("firebase/database");
      vi.mocked(getApps).mockReturnValue([]);

      const mockApp = { name: "[DEFAULT]" };
      const { initializeApp } = await import("firebase/app");
      vi.mocked(initializeApp).mockReturnValue(mockApp as never);

      await import("./firebase");

      expect(getDatabase).toHaveBeenCalledWith(mockApp);
    });

    it("should initialize auth service when app is initialized", async () => {
      Object.defineProperty(global, "window", {
        value: {},
        writable: true,
        configurable: true,
      });

      process.env = {
        ...originalEnv,
        NEXT_PUBLIC_FIREBASE_API_KEY: "test-api-key",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "test-project",
        NEXT_PUBLIC_FIREBASE_DATABASE_URL: "https://test.firebaseio.com",
      };

      const { getApps } = await import("firebase/app");
      const { getAuth } = await import("firebase/auth");
      vi.mocked(getApps).mockReturnValue([]);

      const mockApp = { name: "[DEFAULT]" };
      const { initializeApp } = await import("firebase/app");
      vi.mocked(initializeApp).mockReturnValue(mockApp as never);

      await import("./firebase");

      expect(getAuth).toHaveBeenCalledWith(mockApp);
    });
  });
});
