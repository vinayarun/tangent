import {
    ConversationNode,
    SummaryLayer,
    SummaryLevel,
    EventType
} from '@tangent/shared-types';
import { IEventBus, globalEventBus } from '@tangent/event-bus';

export interface StorageAdapter {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export class SummaryGenerator {
    private bus: IEventBus;
    private storage?: StorageAdapter;

    constructor(storage?: StorageAdapter, bus: IEventBus = globalEventBus) {
        this.bus = bus;
        this.storage = storage;
    }

    async generateSummary(node: ConversationNode, level: SummaryLevel = SummaryLevel.SENTENCE): Promise<SummaryLayer> {
        // MVP Placeholder: Just truncate content
        const summaryContent = `[Summary] ${node.content.substring(0, 50)}...`;

        const id = crypto.randomUUID();
        const summary: SummaryLayer = {
            id,
            targetEntityId: node.id,
            targetEntityType: 'node',
            summaryLevel: level,
            content: summaryContent,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        if (this.storage) {
            await this.storage.setItem(id, summary);
        }

        // Emit updated event for the node (or just a generic update)
        // In a real system we might want a specific SUMMARY_CREATED event.
        // For MVP, reusing NODE_UPDATED or just emitting nothing if not strictly needed by other systems yet.
        // But let's be good citizens and emit.
        this.bus.emit(EventType.NODE_UPDATED, { node, summaryId: id });

        return summary;
    }
}
