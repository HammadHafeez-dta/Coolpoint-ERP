import { useCallback, useContext, useEffect, useRef } from "react";
import { UNSAFE_NavigationContext } from "react-router-dom";

// Registered when the eager page module loads, before BrowserRouter subscribes.
// A late popstate listener can run after the router has already unmounted the form.
let guardPop: ((event: PopStateEvent) => void) | undefined;
if (typeof window !== "undefined") window.addEventListener("popstate", event => guardPop?.(event), true);

/** Protect BrowserRouter links, imperative navigation, history and tab close. */
export function useUnsavedRights(dirty: boolean, busy: boolean, discard: () => void) {
  const { navigator } = useContext(UNSAFE_NavigationContext);
  const state = useRef({ dirty, busy, discard }); state.current = { dirty, busy, discard };
  const confirmDiscard = useCallback(() => {
    if (state.current.busy) return false;
    if (!state.current.dirty) return true;
    if (!window.confirm("Discard unsaved permission changes? Your saved account and permissions will remain.")) return false;
    state.current.dirty = false; state.current.discard(); return true;
  }, []);
  useEffect(() => {
    const push = navigator.push.bind(navigator), replace = navigator.replace.bind(navigator), go = navigator.go.bind(navigator);
    let index = window.history.state?.idx ?? 0; let restoring = false;
    const guardedPush: typeof navigator.push = (...args) => { if (confirmDiscard()) { push(...args); index = window.history.state?.idx ?? index; } };
    const guardedReplace: typeof navigator.replace = (...args) => { if (confirmDiscard()) { replace(...args); index = window.history.state?.idx ?? index; } };
    const guardedGo: typeof navigator.go = delta => { if (confirmDiscard()) go(delta); };
    navigator.push = guardedPush; navigator.replace = guardedReplace; navigator.go = guardedGo;
    const pop = (event: PopStateEvent) => {
      if (restoring) { restoring = false; event.stopImmediatePropagation(); return; }
      const next = event.state?.idx;
      if (next === undefined) return; // Cross-document history is protected by beforeunload.
      if (!confirmDiscard()) {
        event.stopImmediatePropagation(); const delta = index - next;
        if (delta) { restoring = true; window.history.go(delta); }
      } else index = next;
    };
    const unload = (event: BeforeUnloadEvent) => { if (state.current.dirty || state.current.busy) { event.preventDefault(); event.returnValue = ""; } };
    guardPop = pop; window.addEventListener("beforeunload", unload);
    return () => {
      if (navigator.push === guardedPush) navigator.push = push;
      if (navigator.replace === guardedReplace) navigator.replace = replace;
      if (navigator.go === guardedGo) navigator.go = go;
      if (guardPop === pop) guardPop = undefined;
      window.removeEventListener("beforeunload", unload);
    };
  }, [navigator, confirmDiscard]);
  return confirmDiscard;
}
