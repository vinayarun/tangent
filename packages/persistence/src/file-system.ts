import { StorageAdapter } from './adapter';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FileSystemAdapter implements StorageAdapter {
    private baseDir: string;

    constructor(baseDir: string) {
        this.baseDir = baseDir;
    }

    async ensureDir(): Promise<void> {
        try {
            await fs.access(this.baseDir);
        } catch {
            await fs.mkdir(this.baseDir, { recursive: true });
        }
    }

    private getPath(key: string): string {
        // Sanitize key component to prevent directory traversal
        const safeKey = key.replace(/[^a-zA-Z0-9-_]/g, '_');
        return path.join(this.baseDir, `${safeKey}.json`);
    }

    async getItem<T>(key: string): Promise<T | null> {
        await this.ensureDir();
        const filePath = this.getPath(key);
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data) as T;
        } catch (error: any) {
            if (error.code === 'ENOENT') return null;
            throw error;
        }
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        await this.ensureDir();
        const filePath = this.getPath(key);
        await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf-8');
    }

    async removeItem(key: string): Promise<void> {
        const filePath = this.getPath(key);
        try {
            await fs.unlink(filePath);
        } catch (error: any) {
            if (error.code !== 'ENOENT') throw error;
        }
    }

    async clear(): Promise<void> {
        try {
            await fs.rm(this.baseDir, { recursive: true, force: true });
            await this.ensureDir();
        } catch (error) {
            // ignore
        }
    }

    async getAllKeys(): Promise<string[]> {
        await this.ensureDir();
        const files = await fs.readdir(this.baseDir);
        return files
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
    }
}
