import {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { storageClient, BUCKET_NAME } from "../../config/storage.js";
import fs from "fs";
import crypto from "crypto";
import { Readable } from "stream";

const BackupStorage = {

    // ── Upload .kora file to B2 ──────────────────────────────────
    upload: async (
        localFilePath: string,
        fileName: string,
        organisationId: number
    ): Promise<{ url: string; key: string }> => {
        const key = `backups/${organisationId}/${fileName}`;

        const fileStream = fs.createReadStream(localFilePath);
        const fileSize = fs.statSync(localFilePath).size;

        const upload = new Upload({
            client: storageClient,
            params: {
                Bucket: BUCKET_NAME,
                Key: key,
                Body: fileStream,
                ContentType: "application/octet-stream",
                ContentLength: fileSize,
                Metadata: {
                    organisation_id: organisationId.toString(),
                    file_name: fileName,
                    uploaded_at: new Date().toISOString(),
                },
            },
        });

        upload.on("httpUploadProgress", (progress) => {
            console.log(`📤 Uploading ${fileName}: ${progress.loaded}/${progress.total} bytes`);
        });

        await upload.done();

        const url = `${process.env.B2_ENDPOINT}/${BUCKET_NAME}/${key}`;

        console.log(`✅ Uploaded to B2: ${key}`);

        return { url, key };
    },

    // ── Download .kora file from B2 as stream ────────────────────
    download: async (key: string): Promise<Readable> => {
        const command = new GetObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        const response = await storageClient.send(command);

        if (!response.Body) {
            throw new Error("Empty response body from B2");
        }

        return response.Body as Readable;
    },

    // ── Delete .kora file from B2 ────────────────────────────────
    delete: async (key: string): Promise<void> => {
        const command = new DeleteObjectCommand({
            Bucket: BUCKET_NAME,
            Key: key,
        });

        await storageClient.send(command);
        console.log(`🗑️ Deleted from B2: ${key}`);
    },

    // ── Check if file exists on B2 ───────────────────────────────
    exists: async (key: string): Promise<boolean> => {
        try {
            const command = new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            });
            await storageClient.send(command);
            return true;
        } catch {
            return false;
        }
    },

    // ── Compute checksum of local file before upload ─────────────
    computeChecksum: (filePath: string): Promise<string> =>
        new Promise((resolve, reject) => {
            const hash = crypto.createHash("sha256");
            const stream = fs.createReadStream(filePath);
            stream.on("data", (chunk) => hash.update(chunk));
            stream.on("end", () => resolve(hash.digest("hex")));
            stream.on("error", reject);
        }),
};

export default BackupStorage;