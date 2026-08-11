import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { storageClient, BUCKET_NAME } from '../../../config/storage.js';

export interface UploadResult {
    filePath: string; // the object key within the bucket
    fileSize: number;
}

const CONTENT_TYPES: Record<string, string> = {
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdf: 'application/pdf',
    zip: 'application/zip',
};

export const uploadReportFile = async (
    buffer: Buffer,
    fileName: string,
    organisationId: number,
    projectId: number
): Promise<UploadResult> => {
    const extension = fileName.split('.').pop()?.toLowerCase() || 'bin';
    const key = `reports/${organisationId}/${projectId}/${Date.now()}-${fileName}`;

    await storageClient.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: CONTENT_TYPES[extension] || 'application/octet-stream',
    }));

    return { filePath: key, fileSize: buffer.length };
};

// Reports are treated as private objects — generates a time-limited
// signed URL rather than assuming the bucket/object is public.
export const getReportDownloadUrl = async (filePath: string, expiresInSeconds = 3600): Promise<string> => {
    const command = new GetObjectCommand({ Bucket: BUCKET_NAME, Key: filePath });
    return getSignedUrl(storageClient, command, { expiresIn: expiresInSeconds });
};