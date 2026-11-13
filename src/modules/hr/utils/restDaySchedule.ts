export const REST_DAYS = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
] as const;

const parseDay = (value: string): number => {
    const normalized = value.trim().toLowerCase();
    return REST_DAYS.findIndex((day) =>
        day.toLowerCase() === normalized || day.slice(0, 3).toLowerCase() === normalized
    );
};

export const getRestDayIndexes = (value?: string | null): number[] => {
    const normalized = (value ?? "").trim();
    if (!normalized || normalized.toLowerCase() === "none") return [];

    if (/^D:[0-6](?:,[0-6])*$/i.test(normalized)) {
        return Array.from(new Set(normalized.slice(2).split(",").map(Number))).sort((a, b) => a - b);
    }

    return Array.from(new Set(
        normalized.split(/[,;|]/).map(parseDay).filter((day) => day >= 0)
    )).sort((a, b) => a - b);
};

export const formatRestDaySchedule = (value?: string | null): string =>
    getRestDayIndexes(value).map((index) => REST_DAYS[index]).join(", ");

// Explicit schedules use a compact value that fits Employee.Rest_Day VARCHAR(15).
// The prefix distinguishes new selections from legacy single-day rows, whose
// historical Sunday/designation defaults are retained by attendance logic.
export const encodeRestDaySchedule = (value?: string | null): string => {
    const selected = getRestDayIndexes(value);
    if (selected.length === 0) return "";
    return `D:${selected.join(",")}`;
};
