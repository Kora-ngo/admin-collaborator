export interface PeriodRange {
    start: Date;
    end: Date;
    prevStart: Date;
    prevEnd: Date;
}

// Resolves a period preset into a [start, end] window plus the immediately
// preceding window of equal length, used for trend (%) comparisons.
export const resolvePeriodRange = (period: string): PeriodRange => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let start: Date;

    switch (period) {
        case 'today':
            start = today;
            break;
        case 'last_7_days':
            start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'last_3_months':
            start = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            break;
        case 'this_year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
        case 'last_30_days':
        default:
            start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            break;
    }

    const end = now;
    const durationMs = end.getTime() - start.getTime();
    const prevEnd = start;
    const prevStart = new Date(start.getTime() - durationMs);

    return { start, end, prevStart, prevEnd };
};

// Formats a "YYYY-MM" bucket key into a short month label ("Jan", "Feb"...)
export const formatMonthLabel = (yearMonth: string): string => {
    const [year, month] = yearMonth.split('-').map(Number);
    return new Date(year!, month! - 1, 1).toLocaleString('en-US', { month: 'short' });
};

// Computes elapsed-time progress (%) between two dates, clamped 0-100.
// Used as a stand-in for project_performance.progress until a more
// deliverable-based definition is decided.
export const computeTimeProgress = (startDate?: Date | null, endDate?: Date | null): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();
    if (end <= start) return 0;
    const ratio = (now - start) / (end - start);
    return Math.max(0, Math.min(100, Math.round(ratio * 100)));
};