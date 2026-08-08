import * as XLSX from 'xlsx';

export interface ParsedFile {
    headers: string[];
    rows: Record<string, any>[];
}

// Normalizes a raw header string into snake_case for consistent lookup
// e.g. "Family Code" / "family code" / "Family_Code" -> "family_code"
const normalizeHeader = (header: string): string =>
    header.trim().toLowerCase().replace(/\s+/g, '_');

// Reads an uploaded xlsx/csv buffer and returns normalized headers + row objects.
// Row objects are keyed by normalized header names; row 1 is the first data row
// (i.e. right after the header row) to match how spreadsheet apps number rows.
export const parseSpreadsheetFile = (buffer: Buffer): ParsedFile => {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName!];

    // raw header row (as-is), used to detect wrong/missing column names
    const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet!, { header: 1, defval: '' });
    const rawHeaders: string[] = (rawRows[0] || []).map((h: any) => String(h ?? ''));
    const headers = rawHeaders.map(normalizeHeader).filter(Boolean);

    // data rows as objects keyed by normalized headers
    const dataRows = XLSX.utils.sheet_to_json(sheet!, { defval: '' }) as Record<string, any>[];
    const rows = dataRows.map((row) => {
        const normalized: Record<string, any> = {};
        for (const key of Object.keys(row)) {
            normalized[normalizeHeader(key)] = typeof row[key] === 'string' ? row[key].trim() : row[key];
        }
        return normalized;
    });

    return { headers, rows };
};