import ExcelJS from 'exceljs';
import { BeneficiaryExportRepository } from '../queries/beneficiary-export.repository.js';

const calculateAge = (dateOfBirth?: Date | string | null): number | string => {
    if (!dateOfBirth) return '';
    const dob = new Date(dateOfBirth);
    if (isNaN(dob.getTime())) return '';
    const now = new Date();
    let age = now.getFullYear() - dob.getFullYear();
    const monthDiff = now.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
    return age;
};

const formatDate = (date?: Date | string | null): string => {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]!;
};

const capitalize = (s?: string | null): string => (s ? s.charAt(0).toUpperCase() + s.slice(1) : '');

// Identifies the head of the family from its members list, using the
// `relationship` field (e.g. "Head", "head", "HEAD" — case-insensitive
// exact match via the column's ci collation). This replaces the earlier,
// unreliable full_name === head_name string-matching approach.
// Returns undefined if no member is tagged as head — the family's
// Gender/Age columns are left blank in that case, not guessed at.
const findHeadMember = (members: any[]): any | undefined => {
    return members.find((m: any) => String(m.relationship || '').trim().toLowerCase() === 'head');
};

export const buildBeneficiariesExport = async (
    projectId: number,
    projectName: string,
    from?: string,
    to?: string
): Promise<{ buffer: Buffer; fileName: string }> => {
    const beneficiaries = await BeneficiaryExportRepository.findForExport(projectId, from, to);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Beneficiaries');

    sheet.columns = [
        { header: '#', key: 'index', width: 6 },
        { header: 'Beneficiary', key: 'beneficiary', width: 22 },
        { header: 'Gender', key: 'gender', width: 10 },
        { header: 'Age', key: 'age', width: 8 },
        { header: 'Region', key: 'region', width: 16 },
        { header: 'Phone', key: 'phone', width: 16 },
        { header: 'Village', key: 'village', width: 16 },
        { header: 'Registration Date', key: 'registration_date', width: 18 },
        { header: 'Validation Status', key: 'validation_status', width: 16 },
        { header: 'Member', key: 'member', width: 22 },
        { header: 'Relationship', key: 'relationship', width: 16 },
        { header: 'Member Gender', key: 'member_gender', width: 14 },
        { header: 'Member Age', key: 'member_age', width: 12 },
    ];
    sheet.getRow(1).font = { bold: true };

    let rowIndex = 1;

    beneficiaries.forEach((b: any) => {
        const data = b.dataValues;
        const members = (data.members || []).map((m: any) => m.dataValues || m);
        const headMember = findHeadMember(members);

        // Family-level Gender/Age now sourced from the member explicitly
        // tagged relationship = "Head". Intentionally left blank (not
        // guessed) if no such member exists for this family.
        const baseRow = {
            beneficiary: data.head_name,
            gender: headMember ? capitalize(headMember.gender) : '',
            age: headMember ? calculateAge(headMember.date_of_birth) : '',
            region: data.region || '',
            phone: data.phone || '',
            village: data.village || '',
            registration_date: formatDate(data.created_at),
            validation_status: capitalize(data.review_status),
        };

        // Family with no registered members still gets one row so it isn't
        // silently dropped from the export.
        if (members.length === 0) {
            sheet.addRow({ index: rowIndex++, ...baseRow, member: '', relationship: '', member_gender: '', member_age: '' });
            return;
        }

        // Every member row duplicates the family-level fields — this is
        // the flattened "one row = one member, grouped visually by family"
        // format, same convention used in the beneficiaries import template.
        members.forEach((m: any) => {
            sheet.addRow({
                index: rowIndex++,
                ...baseRow,
                member: m.full_name,
                relationship: m.relationship,
                member_gender: capitalize(m.gender),
                member_age: calculateAge(m.date_of_birth),
            });
        });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const safeProjectName = projectName.replace(/[^a-z0-9]+/gi, '_');
    const periodSuffix = from && to ? `_${from}_to_${to}` : '';
    const fileName = `Beneficiaries_${safeProjectName}${periodSuffix}.xlsx`;

    return { buffer: Buffer.from(buffer), fileName };
};