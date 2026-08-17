import path from "path";
import fs from "fs";
import crypto from "crypto";

    
export  const computeChecksum = (filePath: string): Promise<string> =>
        new Promise((resolve, reject) => {
            const hash = crypto.createHash("sha256");
            const stream = fs.createReadStream(filePath);
            stream.on("data", (chunk) => hash.update(chunk));
            stream.on("end", () => resolve(hash.digest("hex")));
            stream.on("error", reject);
        });
    
export const slugify = (name: string): string =>
        name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-]/g, "")
            .replace(/\s+/g, "-")
            .replace(/-+/g, "-");
    
export const formatDateStamp = (): string =>
        new Date().toISOString().slice(0, 10).replace(/-/g, "");
    
export const writeJson = (dir: string, name: string, data: any): void =>
        fs.writeFileSync(path.join(dir, name), JSON.stringify(data, null, 2), "utf-8");

export const buildArchive = (sourceDir: string, outputPath: string): Promise<void> =>
        new Promise((resolve, reject) => {
            try {
                const { ZipArchive } = require("archiver");
    
                const output = fs.createWriteStream(outputPath);
                const archive = new ZipArchive({ zlib: { level: 9 } });
    
                archive.on("warning", (err: any) => {
                    if (err.code === "ENOENT") {
                        console.warn("Archiver warning:", err);
                    } else {
                        reject(err);
                    }
                });
    
                archive.on("error", (err: any) => {
                    console.error("Archiver error:", err);
                    reject(err);
                });
    
                output.on("close", () => {
                    console.log(`✅ Archive created: ${archive.pointer()} bytes`);
                    resolve();
                });
    
                output.on("error", (err: any) => {
                    console.error("Output stream error:", err);
                    reject(err);
                });
    
                archive.pipe(output);
                archive.directory(sourceDir, false);
                archive.finalize();
    
            } catch (err) {
                console.error("buildArchive caught:", err);
                reject(err);
            }
        });