import { ProjectModel } from '../../index.js';

// ============================================================
// Expected import format (one row = one family member)
// ============================================================

export const BENEFICIARY_REQUIRED_COLUMNS = [
    'family_code',
    'head_name',
    'phone',
    'region',
    'village',
    'project',
    'member_name',
    'gender',
    'date_of_birth',
    'relationship',
] as const;

// Fields that fail the row (ERROR) if empty
const MANDATORY_FIELDS = ['family_code', 'head_name', 'project', 'member_name', 'gender', 'date_of_birth', 'relationship'];

// Fields that only warn (WARNING) if empty — import can still proceed
const OPTIONAL_FIELDS = ['phone', 'region', 'village'];

const VALID_GENDERS = ['male', 'female'];

export type IssueSeverity = 'ERROR' | 'WARNING';

export interface ValidationIssue {
    row: number;
    field: string;
    code: string;
    severity: IssueSeverity;
    message?: string;
}

export interface PreviewMember {
    name: string;
    gender: string;
    date_of_birth: string;
    relationship: string;
}

export interface PreviewFamily {
    family_code: string;
    head_name: string;
    phone?: string;
    region?: string;
    village?: string;
    project: { id: number; name: string } | null;
    members: PreviewMember[];
    status: 'READY' | 'HAS_ISSUES';
}

export interface ValidationSummary {
    total_rows: number;
    families_detected: number;
    members_detected: number;
    errors: number;
    warnings: number;
}


// ============================================================
// Stage 2 — Header validation
// ============================================================


export const validateHeaders = (headers: string[]) => {
    const missingColumns = BENEFICIARY_REQUIRED_COLUMNS.filter((col) => !headers.includes(col));
    return { valid: missingColumns.length === 0, missingColumns };
};

// ============================================================
// Stage 3 — Row-level field validation
// ============================================================

const isEmpty = (value: any) => value === undefined || value === null || String(value).trim() === '';

const isValidDate = (value: any): boolean => {
    if (isEmpty(value)) return false;
    const date = value instanceof Date ? value : new Date(value);
    return !isNaN(date.getTime());
};

export const validateRow = (row: Record<string, any>, rowIndex: number): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    for (const field of MANDATORY_FIELDS) {
        if (isEmpty(row[field])) {
            issues.push({ row: rowIndex, field, code: 'MISSING_FIELD', severity: 'ERROR' });
        }
    }

    for (const field of OPTIONAL_FIELDS) {
        if (isEmpty(row[field])) {
            issues.push({ row: rowIndex, field, code: 'MISSING_OPTIONAL_FIELD', severity: 'WARNING' });
        }
    }

    if (!isEmpty(row.gender) && !VALID_GENDERS.includes(String(row.gender).toLowerCase())) {
        issues.push({ row: rowIndex, field: 'gender', code: 'INVALID_GENDER', severity: 'ERROR' });
    }

    if (!isEmpty(row.date_of_birth) && !isValidDate(row.date_of_birth)) {
        issues.push({ row: rowIndex, field: 'date_of_birth', code: 'INVALID_DATE', severity: 'ERROR' });
    }

    return issues;
};


// ============================================================
// Project existence validation (per organisation)
// ============================================================

export const resolveProjectsForRows = async (rows: Record<string, any>[], organisationId: number) => {
    const distinctNames = [...new Set(rows.map((r) => String(r.project || '').trim()).filter(Boolean))];

    const projects = distinctNames.length
        ? await ProjectModel.findAll({
              where: { organisation_id: organisationId, name: distinctNames as any },
              attributes: ['id', 'name'],
          })
        : [];

    const projectMap = new Map<string, { id: number; name: string }>();
    for (const p of projects) {
        projectMap.set(p.dataValues.name, { id: p.dataValues.id, name: p.dataValues.name });
    }

    const issues: ValidationIssue[] = [];
    rows.forEach((row, index) => {
        const projectName = String(row.project || '').trim();
        if (projectName && !projectMap.has(projectName)) {
            issues.push({ row: index + 1, field: 'project', code: 'PROJECT_NOT_FOUND', severity: 'ERROR' });
        }
    });

    return { projectMap, issues };
};

// ============================================================
// Duplicate family consistency validation
// ============================================================

// Same family_code must carry the same head_name/phone/region/village/project
// across every row it appears in.
export const validateFamilyConsistency = (rows: Record<string, any>[]): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];
    const seen = new Map<string, Record<string, any>>();

    rows.forEach((row, index) => {
        const code = String(row.family_code || '').trim();
        if (!code) return;

        const fingerprint = {
            head_name: row.head_name,
            phone: row.phone,
            region: row.region,
            village: row.village,
            project: row.project,
        };

        if (!seen.has(code)) {
            seen.set(code, fingerprint);
            return;
        }

        const first = seen.get(code)!;
        const mismatchField = Object.keys(fingerprint).find(
            (key) => String(first[key] || '') !== String((fingerprint as any)[key] || '')
        );

        if (mismatchField) {
            issues.push({
                row: index + 1,
                field: mismatchField,
                code: 'FAMILY_DATA_MISMATCH',
                severity: 'ERROR',
                message: `Row conflicts with an earlier row sharing family_code "${code}"`,
            });
        }
    });

    return issues;
};

// ============================================================
// Grouping + preview generation
// ============================================================

export const buildFamilyPreview = (
    rows: Record<string, any>[],
    projectMap: Map<string, { id: number; name: string }>,
    rowIssues: Map<number, ValidationIssue[]>
): PreviewFamily[] => {
    const families = new Map<string, PreviewFamily>();

    rows.forEach((row, index) => {
        const code = String(row.family_code || '').trim();
        if (!code) return;

        const rowNumber = index + 1;
        const hasError = (rowIssues.get(rowNumber) || []).some((i) => i.severity === 'ERROR');

        if (!families.has(code)) {
            families.set(code, {
                family_code: code,
                head_name: row.head_name,
                phone: row.phone || undefined,
                region: row.region || undefined,
                village: row.village || undefined,
                project: projectMap.get(String(row.project || '').trim()) || null,
                members: [],
                status: 'READY',
            });
        }

        const family = families.get(code)!;
        family.members.push({
            name: row.member_name,
            gender: row.gender,
            date_of_birth: row.date_of_birth,
            relationship: row.relationship,
        });

        if (hasError) family.status = 'HAS_ISSUES';
    });

    return [...families.values()];
};

export const buildSummary = (
    totalRows: number,
    families: PreviewFamily[],
    allIssues: ValidationIssue[]
): ValidationSummary => ({
    total_rows: totalRows,
    families_detected: families.length,
    members_detected: families.reduce((sum, f) => sum + f.members.length, 0),
    errors: allIssues.filter((i) => i.severity === 'ERROR').length,
    warnings: allIssues.filter((i) => i.severity === 'WARNING').length,
});