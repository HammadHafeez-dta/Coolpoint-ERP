import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import "./CoolpointLoader.css";

export const COOLPOINT_SEQUENCE_MS = 5000;
export const COOLPOINT_EXIT_MS = 180;
const LOGO = "/coolpoint-logo-navy.png";

interface CoolpointLoaderProps {
  active?: boolean;
  fullScreen?: boolean;
  complete?: boolean;
  delayMs?: number;
  label?: string;
}

/** Keep mounted and change `active` so the exit can finish. No minimum module delay. */
export function CoolpointLoader({ active = true, fullScreen = false, complete = false,
  delayMs = fullScreen ? 0 : 150, label = "Loading Coolpoint workspace" }: CoolpointLoaderProps) {
  const [phase, setPhase] = useState<"hidden" | "visible" | "exiting">(
    active && delayMs === 0 ? "visible" : "hidden",
  );
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) {
      const timer = window.setTimeout(() => setPhase("visible"), delayMs);
      return () => window.clearTimeout(timer);
    }
    setPhase(previous => previous === "hidden" ? "hidden" : "exiting");
    const timer = window.setTimeout(() => setPhase("hidden"), COOLPOINT_EXIT_MS);
    return () => window.clearTimeout(timer);
  }, [active, delayMs]);

  const present = phase !== "hidden";
  useEffect(() => {
    if (!fullScreen || !present) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    statusRef.current?.focus({ preventScroll: true });
    return () => {
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [fullScreen, present]);

  if (!present) return null;
  const content = (
    <div ref={statusRef} role="status" aria-label={label} aria-live="polite"
      aria-busy={active} tabIndex={-1}
      className={`coolpoint-loader ${fullScreen ? "coolpoint-loader--fullscreen" : "coolpoint-loader--content"}`}
      data-phase={phase} data-complete={complete || undefined}>
      <div className="coolpoint-loader__logo" aria-hidden="true">
        <img className="coolpoint-loader__base" src={LOGO} alt="" width="286" height="60" draggable={false} />
        <img className="coolpoint-loader__color" src={LOGO} alt="" width="286" height="60" draggable={false} />
        <span className="coolpoint-loader__reflection"><span /></span>
        <span className="coolpoint-loader__afterglow"><span /></span>
      </div>
    </div>
  );
  return fullScreen ? createPortal(content, document.body) : content;
}

/** Overlay only the essential content; keep mounted children and their requests alive. */
export function CoolpointLoadingBoundary({ loading, children, label, className = "" }: {
  loading: boolean; children: ReactNode; label?: string; className?: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (contentRef.current) contentRef.current.inert = loading;
  }, [loading]);
  return (
    <div className={`coolpoint-loading-boundary ${className}`} aria-busy={loading}>
      <div ref={contentRef} className="coolpoint-loading-boundary__content" data-loading={loading || undefined}>
        {children}
      </div>
      <CoolpointLoader active={loading} label={label} />
    </div>
  );
}
