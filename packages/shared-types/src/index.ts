// Common
export * from './common/entity';

// Domains
export * from './conversation';
export * from './knowledge';
export * from './reasoning';
export * from './summary';
export * from './event';

// Plugin System (Keeping existing simplified interface for now, might need update)
export interface PluginMetadata {
    id: string;
    name: string;
    version: string;
    description?: string;
}

export interface TangentContext {
    eventBus: any; // typed as IEventBus in implementation
    workspace: any;
}

export interface Plugin {
    metadata: PluginMetadata;
    activate(context: TangentContext): Promise<void> | void;
    deactivate?(): Promise<void> | void;
}
