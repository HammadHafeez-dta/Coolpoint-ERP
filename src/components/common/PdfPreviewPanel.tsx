import React, { forwardRef } from 'react';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/shared/utils/utils';

export interface PdfPreviewPanelProps {
  /** Blob URL or source URL of the PDF */
  src?: string | null;
  /** Alias for src */
  url?: string | null;
  /** Panel title displayed in the pinned header */
  title?: React.ReactNode;
  /** Optional subtitle or badge displayed in the pinned header */
  subtitle?: React.ReactNode;
  /** Optional icon displayed in the pinned header */
  icon?: React.ReactNode;
  /** Actions rendered on the right side of the pinned header (e.g. Print, Download) */
  actions?: React.ReactNode;
  /** Header children or extra header content */
  children?: React.ReactNode;
  /** Loading state indicator */
  loading?: boolean;
  /** Alias for loading */
  isLoading?: boolean;
  /** Custom text for loading indicator */
  loadingText?: string;
  /** Alias for loadingText */
  loadingMessage?: string;
  /** Empty state message or description */
  emptyMessage?: React.ReactNode;
  /** Empty state title */
  emptyTitle?: string;
  /** Optional custom empty state icon */
  emptyIcon?: React.ReactNode;
  /** Optional error message */
  error?: React.ReactNode;
  /** Alias for error */
  errorMessage?: React.ReactNode;
  /** HTML title attribute for the iframe */
  iframeTitle?: string;
  /** HTML ID for the iframe */
  iframeId?: string;
  /** Additional class name for outer panel container */
  className?: string;
  /** Whether to hide the pinned header */
  hideHeader?: boolean;
  /** Additional styling for iframe container */
  contentClassName?: string;
}

/**
 * Standard container layout classes for 2-column report pages:
 * - PDF_PAGE_CONTAINER_CLASS: fixed height viewport minus header (h-[calc(100vh-3.5rem)]), min-h-[480px], overflow-hidden
 * - PDF_PAGE_SIDEBAR_CLASS: left column scrolling independently with overflow-y-auto
 * - PDF_PAGE_PREVIEW_CLASS: right preview column pinned without expanding parent
 */
export const PDF_PAGE_CONTAINER_CLASS = "flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 p-6 gap-6 min-h-[480px] h-[calc(100vh-3.5rem)]";
export const PDF_PAGE_SIDEBAR_CLASS = "md:col-span-4 h-full overflow-y-auto pr-1 space-y-6 min-h-0";
export const PDF_PAGE_PREVIEW_CLASS = "md:col-span-8 h-full min-h-0 overflow-hidden";

export const PdfPreviewPanel = forwardRef<HTMLIFrameElement, PdfPreviewPanelProps>(
  (
    {
      src,
      url,
      title = "Report PDF Preview",
      subtitle,
      icon,
      actions,
      children,
      loading = false,
      isLoading = false,
      loadingText = "Loading PDF Document...",
      loadingMessage,
      emptyMessage = "Select report settings and click generate to preview the PDF.",
      emptyTitle = "No Preview Available",
      emptyIcon,
      error,
      errorMessage,
      iframeTitle = "PDF Document Preview",
      iframeId,
      className,
      hideHeader = false,
      contentClassName,
    },
    ref
  ) => {
    const effectiveSrc = src ?? url ?? null;
    const effectiveLoading = Boolean(loading || isLoading);
    const effectiveLoadingText = loadingMessage ?? loadingText;
    const effectiveError = error ?? errorMessage;

    return (
      <div
        className={cn(
          "flex flex-col h-full w-full min-h-0 bg-card rounded-xl border border-border shadow-sm overflow-hidden",
          className
        )}
      >
        {!hideHeader && (
          <div className="h-12 border-b border-border bg-secondary/10 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-2 overflow-hidden pr-2">
              {icon}
              <div className="truncate">
                {typeof title === 'string' ? (
                  <span className="text-xs font-bold text-foreground truncate block">
                    {title}
                  </span>
                ) : (
                  title
                )}
                {subtitle && (
                  <div className="text-[10px] text-muted-foreground truncate">
                    {subtitle}
                  </div>
                )}
              </div>
            </div>

            {(actions || children) && (
              <div className="flex items-center gap-2 shrink-0">
                {actions}
                {children}
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            "flex-1 w-full h-full min-h-0 bg-secondary/5 relative overflow-hidden",
            contentClassName
          )}
        >
          {effectiveLoading ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center gap-3 bg-background/80 backdrop-blur-sm z-10 p-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-xs font-semibold text-muted-foreground text-center">
                {effectiveLoadingText}
              </p>
            </div>
          ) : effectiveError ? (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 gap-3 z-10 bg-background">
              <div className="p-3 bg-destructive/10 text-destructive rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
              <p className="text-sm font-bold text-foreground">Unable to display PDF</p>
              <p className="text-xs text-muted-foreground max-w-sm">{effectiveError}</p>
            </div>
          ) : effectiveSrc ? (
            <iframe
              ref={ref}
              id={iframeId}
              src={effectiveSrc}
              title={iframeTitle}
              className="w-full h-full border-none block"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 gap-3 select-none">
              <div className="bg-primary/5 p-4 rounded-full border border-primary/10">
                {emptyIcon || <FileText className="w-10 h-10 text-primary/40" />}
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{emptyTitle}</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {emptyMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PdfPreviewPanel.displayName = 'PdfPreviewPanel';

export default PdfPreviewPanel;
