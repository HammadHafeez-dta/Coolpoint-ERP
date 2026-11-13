import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { usePermissionsStore } from '../store/permissionsStore';
import { userRightsService } from '../services/userRightsService';
import { authService } from '@/modules/auth/services/authService';

// ─── Context ─────────────────────────────────────────────────────────────────

interface PermissionsContextType {
    isLoaded: boolean;
    refresh: () => Promise<void>;
}

const PermissionsContext = createContext<PermissionsContextType>({
    isLoaded: false,
    refresh: async () => {},
});

export const usePermissionsContext = () => useContext(PermissionsContext);

// ─── Provider ────────────────────────────────────────────────────────────────

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setBundle, clearPermissions, isLoaded } = usePermissionsStore();
    const requestRef = useRef<AbortController | null>(null);
    const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [hasError, setHasError] = useState(false);
    const [isDismissed, setIsDismissed] = useState(false);

    const cancelPending = useCallback(() => {
        requestRef.current?.abort();
        requestRef.current = null;
        if (retryRef.current !== null) {
            clearTimeout(retryRef.current);
            retryRef.current = null;
        }
    }, []);

    const fetchPermissions = useCallback(async () => {
        cancelPending();
        const token = authService.getToken();
        if (!token) return;

        const controller = new AbortController();
        requestRef.current = controller;
        const isCurrent = () => !controller.signal.aborted && authService.getToken() === token;
        setHasError(false);
        setIsDismissed(false);

        const attempt = async (isRetry: boolean) => {
            if (!isCurrent()) return;
            try {
                const bundle = await userRightsService.getMyPermissions(controller.signal);
                // A response from a previous session must never restore its permissions.
                if (!isCurrent()) return;
                setBundle(bundle);
                setHasError(false);
                setIsDismissed(false);
            } catch (err) {
                if (!isCurrent()) return;
                console.warn('[PermissionsProvider] Failed to load permissions:', err);
                if (!isRetry) {
                    retryRef.current = setTimeout(() => {
                        retryRef.current = null;
                        void attempt(true);
                    }, 1000);
                } else {
                    setHasError(true);
                    setIsDismissed(false);
                }
            }
        };

        await attempt(false);
    }, [cancelPending, setBundle]);

    useEffect(() => {
        const handleAuthChanged = () => {
            cancelPending();
            clearPermissions();
            setHasError(false);
            setIsDismissed(false);
            if (authService.getToken()) void fetchPermissions();
        };

        window.addEventListener("auth-changed", handleAuthChanged);
        if (!authService.getToken()) {
            clearPermissions();
        } else if (!usePermissionsStore.getState().isLoaded) {
            void fetchPermissions();
        }
        return () => {
            window.removeEventListener("auth-changed", handleAuthChanged);
            cancelPending();
        };
    }, [cancelPending, clearPermissions, fetchPermissions]);

    const refresh = fetchPermissions;

    return (
        <PermissionsContext.Provider value={{ isLoaded, refresh }}>
            {hasError && !isDismissed && (
                <div className="bg-amber-500 text-white px-4 py-1.5 text-xs font-medium flex items-center justify-between sticky top-0 z-50 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span>Could not load permissions.</span>
                        <button
                            type="button"
                            onClick={() => refresh()}
                            className="underline font-bold hover:text-amber-100 cursor-pointer"
                        >
                            Retry
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsDismissed(true)}
                        className="text-white hover:text-amber-100 ml-4 cursor-pointer"
                        aria-label="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            )}
            {children}
        </PermissionsContext.Provider>
    );
};
