import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageClient, BUCKET_NAME } from '../../../config/storage.js';

export interface UploadResult {
    filePath: string;
    fileSize: number;
}

const CONTENT_TYPES: Record<string, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    zip: 'application/zip',
};

// Sanitizes a name for safe use as a path segment in an object key —
// same pattern already used for filenames elsewhere in the report module.
const sanitizeSegment = (value: string): string =>
    value.trim().replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '');

export const uploadReportFile = async (
    buffer: Buffer,
    fileName: string,
    organisationName: string,
    projectName: string
): Promise<UploadResult> => {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'bin';

    const orgSegment = sanitizeSegment(organisationName) || 'unknown_org';
    const projectSegment = sanitizeSegment(projectName) || 'unknown_project';

    // report/{organisation_name}/{project_name}/report/{filename}
    // Deposited directly at this key — B2/S3 has no real folder concept,
    // so no separate "create folder" step is needed; the path structure
    // is implied by the key and appears automatically in the bucket UI.
    const key = `report/${orgSegment}/${projectSegment}/report/${fileName}`;

    await storageClient.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: CONTENT_TYPES[extension] || 'application/octet-stream',
    }));

    return { filePath: key, fileSize: buffer.length };
};

export const getReportFileStream = async (filePath: string) => {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: filePath });
    const response = await storageClient.send(command);

    return {
        body: response.Body, // a readable stream
        contentType: response.ContentType || 'application/octet-stream',
        contentLength: response.ContentLength,
    };
};