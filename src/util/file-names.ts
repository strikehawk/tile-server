export function sanitizePath(filePath: string): string {
    return filePath.replace(":", "_").replace(" ", "_");
}