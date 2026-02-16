export const base64ToBuffer = (base64String: string): { buffer: Buffer, mimetype: string, originalname: string, size: number } => {
    // Extract data URL parts: data:image/png;base64,iVBORw0KG...
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    
    if (!matches || matches.length !== 3) {
        throw new Error('Invalid base64 string');
    }

    const mimetype = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data!, 'base64');


    return {
        buffer,
        mimetype: mimetype!,
        originalname: `file_${Date.now()}`,
        size: buffer.length
    };
};