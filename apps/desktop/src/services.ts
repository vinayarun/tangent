import { ConversationManager } from '@tangent/conversation-engine';
import { GraphStore, GraphExtractor } from '@tangent/knowledge-graph';
import { ContextManager, SummaryGenerator } from '@tangent/ai-context';
import { globalEventBus, IEventBus } from '@tangent/event-bus';
// For MVP Desktop, we might want a simple localStorage adapter or Electron/Tauri file system adapter.
// Since we don't have a Tauri file system adapter ready in shared-packages, 
// let's create a partial one or just use in-memory for the UI demo 
// OR use the FileSystemAdapter if we are running in Node context (Tauri backend).
// But the UI runs in browser context.
// CRITICAL: apps/desktop UI is a browser environment. It cannot use 'fs'.
// We need a strictly browser-compatible StorageAdapter (e.g., IndexedDB or LocalStorage).
// For MVP, allow's make a simple LocalStorageAdapter inline here or in persistence.

// Let's check if @tangent/persistence has a browser adapter.
// It likely only has FileSystemAdapter (Node).
// We should probably implement a LocalStorageAdapter for this phase to allow the UI to work without crashing.

interface StorageAdapter {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
    clear?(): Promise<void>;
    getAllKeys?(): Promise<string[]>;
}

class LocalStorageAdapter implements StorageAdapter {
    private prefix: string;
    constructor(prefix: string) {
        this.prefix = prefix;
    }

    async getItem<T>(key: string): Promise<T | null> {
        const item = localStorage.getItem(`${this.prefix}:${key}`);
        return item ? JSON.parse(item) : null;
    }

    async setItem<T>(key: string, value: T): Promise<void> {
        localStorage.setItem(`${this.prefix}:${key}`, JSON.stringify(value));
        // Add to key list for simulation of file system header
        this.addKey(key);
    }

    async removeItem(key: string): Promise<void> {
        localStorage.removeItem(`${this.prefix}:${key}`);
        this.removeKey(key);
    }

    private addKey(key: string) {
        const indexKey = `${this.prefix}:_keys`;
        const keys = JSON.parse(localStorage.getItem(indexKey) || '[]');
        if (!keys.includes(key)) {
            keys.push(key);
            localStorage.setItem(indexKey, JSON.stringify(keys));
        }
    }

    private removeKey(key: string) {
        const indexKey = `${this.prefix}:_keys`;
        let keys = JSON.parse(localStorage.getItem(indexKey) || '[]');
        keys = keys.filter((k: string) => k !== key);
        localStorage.setItem(indexKey, JSON.stringify(keys));
    }

    async getAllKeys(): Promise<string[]> {
        const indexKey = `${this.prefix}:_keys`;
        return JSON.parse(localStorage.getItem(indexKey) || '[]');
    }
}

import { GeminiProvider, LLMProvider } from '@tangent/llm';

// Services Singleton
class Services {
    public bus: IEventBus;
    public conversation: ConversationManager;
    public graph: GraphStore;
    public extractor: GraphExtractor;
    public context: ContextManager;
    public summaries: SummaryGenerator;
    public llm: LLMProvider | null = null;

    // Key for localStorage
    private apiKeyKey = 'tangent:api_key';

    constructor() {
        this.bus = globalEventBus;

        // Use LocalStorage for Persistence in Browser/Desktop UI for now
        // In real Tauri app, we'd bridge to Rust fs or use Tauri fs API.
        const sessionStore = new LocalStorageAdapter('tangent:session');
        const nodeStore = new LocalStorageAdapter('tangent:node');
        const entityStore = new LocalStorageAdapter('tangent:entity');
        const relationStore = new LocalStorageAdapter('tangent:relation');
        const summaryStore = new LocalStorageAdapter('tangent:summary');

        this.conversation = new ConversationManager(this.bus, sessionStore, nodeStore);
        this.graph = new GraphStore(this.bus, entityStore, relationStore);
        this.extractor = new GraphExtractor(this.graph, this.bus);

        this.summaries = new SummaryGenerator(summaryStore, this.bus);
        this.context = new ContextManager(this.conversation, undefined); // Default strategy
    }

    async init() {
        await this.loadLLM();
        console.log('Services Initialized');
    }

    private async loadLLM() {
        let key = localStorage.getItem(this.apiKeyKey);

        // Fallback to Env Var (Vite)
        // Note: import.meta.env is Vite specific. TS might need types.
        if (!key && import.meta.env && import.meta.env.VITE_GEMINI_API_KEY) {
            key = import.meta.env.VITE_GEMINI_API_KEY;
            console.log('Using API Key from Environment');
        }

        if (key) {
            try {
                this.llm = new GeminiProvider(key);
                this.extractor.setLLMProvider(this.llm);
                console.log('LLM Provider Initialized (Gemini)');
            } catch (e) {
                console.error('Failed to init LLM', e);
            }
        } else {
            console.warn('No API Key found. AI features disabled.');
        }
    }

    async setApiKey(key: string) {
        localStorage.setItem(this.apiKeyKey, key);
        await this.loadLLM();
    }

    async getApiKey(): Promise<string | null> {
        return localStorage.getItem(this.apiKeyKey) || (import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null) || null;
    }
}

export const services = new Services();
