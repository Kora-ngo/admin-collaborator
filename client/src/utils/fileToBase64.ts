export const fileToBase64 = (file: File): Promise<{ name: string; base64: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            resolve({
                name: file.name,
                base64: reader.result as string
            });
        };
        reader.onerror = error => reject(error);
    });
};