import { vi, type Mock } from "vitest";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

type AuthStateChangeListener = (event: AuthChangeEvent, session: Session | null) => void;

interface AuthStateSubscription {
  unsubscribe: Mock<() => void>;
}

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
  reject: (reason?: unknown) => void;
}

const createDeferred = <T>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

export interface SupabaseAuthMockControls {
  emitAuthStateChange(event: AuthChangeEvent, session: Session | null): void;
  resolveGetSession(session: Session | null): void;
  rejectGetSession(error: unknown): void;
  reset(): void;
  getSubscriptions(): readonly AuthStateSubscription[];
  getListeners(): readonly AuthStateChangeListener[];
}

export interface SupabaseAuthMock {
  controls: SupabaseAuthMockControls;
  supabaseAuth: {
    getSession: Mock<() => Promise<{ data: { session: Session | null } }>>;
    onAuthStateChange: Mock<
      (listener: AuthStateChangeListener) => { data: { subscription: AuthStateSubscription } }
    >;
    signInWithOAuth: Mock<(arg: unknown) => Promise<{ data: null; error: null }>>;
  };
}

export function createSupabaseAuthMock(): SupabaseAuthMock {
  const listeners = new Set<AuthStateChangeListener>();
  const subscriptions: AuthStateSubscription[] = [];

  const getSessionMock: Mock<() => Promise<{ data: { session: Session | null } }>> = vi.fn();
  let getSessionDeferred: Deferred<{ data: { session: Session | null } }>;

  const resetGetSessionDeferred = () => {
    getSessionDeferred = createDeferred<{ data: { session: Session | null } }>();
    getSessionMock.mockImplementation(() => getSessionDeferred.promise);
  };

  resetGetSessionDeferred();

  const resolveGetSession = (session: Session | null) => {
    getSessionDeferred.resolve({ data: { session } });
    resetGetSessionDeferred();
  };

  const rejectGetSession = (error: unknown) => {
    getSessionDeferred.reject(error);
    resetGetSessionDeferred();
  };

  const onAuthStateChangeMock: Mock<
    (listener: AuthStateChangeListener) => { data: { subscription: AuthStateSubscription } }
  > = vi.fn((listener) => {
    listeners.add(listener);
    const unsubscribe = vi.fn(() => {
      listeners.delete(listener);
    });
    const subscription: AuthStateSubscription = { unsubscribe };
    subscriptions.push(subscription);
    return { data: { subscription } };
  });

  const signInWithOAuthMock: Mock<(arg: unknown) => Promise<{ data: null; error: null }>> = vi.fn(() =>
    Promise.resolve({ data: null, error: null })
  );

  const emitAuthStateChange = (event: AuthChangeEvent, session: Session | null) => {
    listeners.forEach((listener) => listener(event, session));
  };

  const reset = () => {
    listeners.clear();
    subscriptions.length = 0;
    getSessionMock.mockClear();
    onAuthStateChangeMock.mockClear();
    signInWithOAuthMock.mockClear();
    resetGetSessionDeferred();
    signInWithOAuthMock.mockImplementation(() =>
      Promise.resolve({ data: null, error: null })
    );
  };

  return {
    supabaseAuth: {
      getSession: getSessionMock,
      onAuthStateChange: onAuthStateChangeMock,
      signInWithOAuth: signInWithOAuthMock,
    },
    controls: {
      emitAuthStateChange,
      resolveGetSession,
      rejectGetSession,
      reset,
      getSubscriptions: () => subscriptions,
      getListeners: () => Array.from(listeners),
    },
  };
}
