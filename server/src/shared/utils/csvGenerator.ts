// utils/csvGenerator.ts

export const generateCSV = (headers: string[], rows: any[][]): string => {
    const escapeCsvValue = (value: any): string => {
        if (value === null || value === undefined) return '';
        
        const stringValue = String(value);
        
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
    };

    // Create header row
    const headerRow = headers.map(escapeCsvValue).join(',');
    
    // Create data rows
    const dataRows = rows.map(row => 
        row.map(escapeCsvValue).join(',')
    );
    
    return [headerRow, ...dataRows].join('\n');
};