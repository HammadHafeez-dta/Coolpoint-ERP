import { flushSync } from 'react-dom';
import { authService } from './authService';

let signingOut = false;

/** Keep the old view only as an animation snapshot; clear the session in the navigation update. */
export function logoutWithTransition(navigateToLogin: () => void) {
    if (signingOut) return;
    signingOut = true;
    let committed = false;
    const root = document.documentElement;
    const commit = () => {
        if (committed) return Promise.resolve();
        committed = true;
        flushSync(() => {
            authService.logout();
            navigateToLogin();
        });
        // Router updates may finish after the synchronous session cleanup.
        // Keep the transition snapshot until the sign-in form has actually mounted.
        return new Promise<void>(resolve => {
            const focusLogin = () => {
                const username = document.querySelector<HTMLInputElement>('[autocomplete="username"]');
                if (!username) return false;
                username.focus({ preventScroll: true });
                return true;
            };
            if (focusLogin()) { resolve(); return; }
            const observer = new MutationObserver(() => { if (focusLogin()) done(); });
            const timer = window.setTimeout(done, 1000);
            function done() { observer.disconnect(); window.clearTimeout(timer); resolve(); }
            observer.observe(document.body, { childList: true, subtree: true });
        });
    };
    const finish = () => {
        root.classList.remove('logout-transition');
        signingOut = false;
    };

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.visibilityState === 'hidden') {
        void commit().then(finish, finish);
        return;
    }

    if (typeof document.startViewTransition === 'function') {
        root.classList.add('logout-transition');
        try {
            const transition = document.startViewTransition(commit);
            // A skipped animation must still complete logout and release the repeat-click guard.
            void transition.ready.catch(() => {});
            void transition.finished.then(finish, () => { void commit().then(finish, finish); });
            return;
        } catch {
            root.classList.remove('logout-transition');
        }
    }

    void commit().then(() => {
        const animation = document.getElementById('root')?.animate?.(
            [{ opacity: 0.35 }, { opacity: 1 }],
            { duration: 200, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' },
        );
        if (animation) void animation.finished.then(finish, finish);
        else finish();
    }).catch(finish);
}
