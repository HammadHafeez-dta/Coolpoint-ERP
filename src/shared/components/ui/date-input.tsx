import * as React from "react";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Calendar } from "@/shared/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { cn } from "@/shared/utils/utils";

interface DateInputProps {
    /** ISO date (yyyy-MM-dd) or empty string */
    value?: string | null;
    onChange: (value: string) => void;
    onBlur?: () => void;
    id?: string;
    className?: string;
    disabled?: boolean;
    "aria-invalid"?: boolean;
}

const pad = (n: number) => String(n).padStart(2, "0");
const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

const isoToDisplay = (iso?: string | null) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso ?? "");
    return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
};

const displayToIso = (text: string) => {
    const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
    if (!m) return null;
    const [d, mo, y] = [Number(m[1]), Number(m[2]), Number(m[3])];
    if (y < MIN_YEAR || y > MAX_YEAR) return null;
    const date = new Date(y, mo - 1, d);
    if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
    return `${y}-${pad(mo)}-${pad(d)}`;
};

// Keeps digits only and inserts the slashes while typing: 05112026 -> 05/11/2026
const maskDigits = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const YEARS_PER_PAGE = 12;

type PanelView = "days" | "months" | "years";

// Month/year are picked from in-panel grids rather than native selects, which don't open reliably inside modals
function CalendarPanel({ selected, onPick }: { selected?: Date; onPick: (iso: string) => void }) {
    const [month, setMonth] = React.useState<Date>(selected ?? new Date());
    const [view, setView] = React.useState<PanelView>("days");
    const [yearPageStart, setYearPageStart] = React.useState(0);

    const year = month.getFullYear();
    const openYears = () => {
        setYearPageStart(Math.max(MIN_YEAR, year - (year % YEARS_PER_PAGE)));
        setView("years");
    };

    const headerBtn =
        "rounded-md px-2 py-1 text-sm font-medium transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
    const navBtn =
        "flex h-7 w-7 items-center justify-center rounded-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40";
    const cell = (active: boolean) =>
        cn(
            "h-10 rounded-md text-sm transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            active && "bg-primary text-primary-foreground hover:bg-primary",
        );

    if (view === "months") {
        return (
            <div className="w-[17.5rem] p-3">
                <div className="mb-3 flex items-center justify-between">
                    <button type="button" className={headerBtn} onClick={openYears}>{year}</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {MONTHS.map((name, i) => (
                        <button
                            key={name}
                            type="button"
                            className={cell(i === month.getMonth())}
                            onClick={() => {
                                setMonth(new Date(year, i, 1));
                                setView("days");
                            }}
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    if (view === "years") {
        const years = Array.from({ length: YEARS_PER_PAGE }, (_, i) => yearPageStart + i).filter((y) => y >= MIN_YEAR && y <= MAX_YEAR);
        return (
            <div className="w-[17.5rem] p-3">
                <div className="mb-3 flex items-center justify-between">
                    <button type="button" aria-label="Earlier years" className={navBtn} disabled={yearPageStart <= MIN_YEAR} onClick={() => setYearPageStart((s) => s - YEARS_PER_PAGE)}>
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-medium tabular-nums">{years[0]} to {years[years.length - 1]}</span>
                    <button type="button" aria-label="Later years" className={navBtn} disabled={yearPageStart + YEARS_PER_PAGE > MAX_YEAR} onClick={() => setYearPageStart((s) => s + YEARS_PER_PAGE)}>
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                    {years.map((y) => (
                        <button
                            key={y}
                            type="button"
                            className={cn(cell(y === year), "tabular-nums")}
                            onClick={() => {
                                setMonth(new Date(y, month.getMonth(), 1));
                                setView("months");
                            }}
                        >
                            {y}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between px-3 pt-3">
                <button type="button" aria-label="Previous month" className={navBtn} disabled={year <= MIN_YEAR && month.getMonth() === 0} onClick={() => setMonth(new Date(year, month.getMonth() - 1, 1))}>
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1">
                    <button type="button" className={headerBtn} onClick={() => setView("months")}>{MONTHS_LONG[month.getMonth()]}</button>
                    <button type="button" className={cn(headerBtn, "tabular-nums")} onClick={openYears}>{year}</button>
                </div>
                <button type="button" aria-label="Next month" className={navBtn} disabled={year >= MAX_YEAR && month.getMonth() === 11} onClick={() => setMonth(new Date(year, month.getMonth() + 1, 1))}>
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
            <Calendar
                mode="single"
                month={month}
                onMonthChange={setMonth}
                selected={selected}
                classNames={{ caption: "hidden", nav: "hidden" }}
                onSelect={(d) => {
                    if (d) onPick(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                }}
                initialFocus
            />
        </div>
    );
}

const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/**
 * Type the date directly as DD/MM/YYYY (slashes are added automatically),
 * or open the calendar with the button. Emits ISO yyyy-MM-dd only for valid dates.
 */
export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
    ({ value, onChange, onBlur, id, className, disabled, ...rest }, ref) => {
        const [text, setText] = React.useState(isoToDisplay(value));
        const [open, setOpen] = React.useState(false);

        // Follow external changes (form reset, auto-filled values) without clobbering partial typing
        React.useEffect(() => {
            if ((displayToIso(text) ?? "") !== (value || "")) setText(isoToDisplay(value));
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [value]);

        const selected = value ? displayToIso(isoToDisplay(value)) : null;
        const selectedDate = selected ? new Date(`${selected}T00:00:00`) : undefined;
        const invalid = text.length > 0 && displayToIso(text) === null;

        return (
            <div
                className={cn(
                    "flex h-9 w-full items-center rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                    invalid && "border-destructive focus-within:ring-destructive",
                    disabled && "cursor-not-allowed opacity-50",
                    className,
                )}
            >
                <input
                    ref={ref}
                    id={id}
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="DD/MM/YYYY"
                    maxLength={10}
                    disabled={disabled}
                    aria-invalid={invalid || rest["aria-invalid"]}
                    value={text}
                    onChange={(e) => {
                        const masked = maskDigits(e.target.value);
                        setText(masked);
                        if (masked === "") onChange("");
                        else {
                            const iso = displayToIso(masked);
                            if (iso) onChange(iso);
                        }
                    }}
                    onBlur={() => {
                        // Incomplete or impossible dates fall back to the last valid value
                        if (displayToIso(text) === null && text !== "") setText(isoToDisplay(value));
                        onBlur?.();
                    }}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 tabular-nums outline-none placeholder:text-muted-foreground"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <button
                            type="button"
                            disabled={disabled}
                            aria-label="Open calendar"
                            className="flex h-full w-9 shrink-0 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:text-foreground"
                        >
                            <CalendarIcon className="h-4 w-4" aria-hidden="true" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent className="pointer-events-auto z-[100] w-auto p-0" align="end">
                        <CalendarPanel
                            selected={selectedDate}
                            onPick={(iso) => {
                                setText(isoToDisplay(iso));
                                onChange(iso);
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        );
    },
);
DateInput.displayName = "DateInput";
