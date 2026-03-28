import {
    KnowledgeEntity,
    KnowledgeRelation,
    KnowledgeEntityType,
    EventType
} from '@tangent/shared-types';
import { IEventBus, globalEventBus } from '@tangent/event-bus';

export interface StorageAdapter {
    getItem<T>(key: string): Promise<T | null>;
    setItem<T>(key: string, value: T): Promise<void>;
    removeItem(key: string): Promise<void>;
}

export class GraphStore {
    private entities: Map<string, KnowledgeEntity> = new Map();
    private relations: Map<string, KnowledgeRelation> = new Map();
    private bus: IEventBus;
    private entityStorage?: StorageAdapter;
    private relationStorage?: StorageAdapter;

    constructor(
        bus: IEventBus = globalEventBus,
        entityStorage?: StorageAdapter,
        relationStorage?: StorageAdapter
    ) {
        this.bus = bus;
        this.entityStorage = entityStorage;
        this.relationStorage = relationStorage;
    }

    async loadEntity(id: string): Promise<KnowledgeEntity | undefined> {
        if (this.entities.has(id)) return this.entities.get(id);
        if (this.entityStorage) {
            const entity = await this.entityStorage.getItem<KnowledgeEntity>(id);
            if (entity) {
                this.entities.set(id, entity);
                return entity;
            }
        }
        return undefined;
    }

    async addEntity(label: string, type: KnowledgeEntityType): Promise<KnowledgeEntity> {
        // Check for existing (simple dedup by label for MVP)
        // In real app, use an index. For MVP, linear scan of *loaded* entities
        // or just strict ID based. Let's assume ID based for now, but label dedup is critical for Graph.
        // For MVP: JUST create new.

        const id = crypto.randomUUID();
        const entity: KnowledgeEntity = {
            id,
            label,
            type,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        this.entities.set(id, entity);
        await this.entityStorage?.setItem(id, entity);
        this.bus.emit(EventType.ENTITY_CREATED, { entity });
        return entity;
    }

    async addRelation(sourceId: string, targetId: string, relationType: any): Promise<KnowledgeRelation> {
        const id = crypto.randomUUID();
        const relation: KnowledgeRelation = {
            id,
            sourceEntityId: sourceId,
            targetEntityId: targetId,
            relationType,
            createdAt: new Date(),
            updatedAt: new Date(),
            version: 1,
            metadata: {}
        };

        this.relations.set(id, relation);
        await this.relationStorage?.setItem(id, relation);
        this.bus.emit(EventType.RELATION_CREATED, { relation });
        return relation;
    }

    getSnapshot() {
        return {
            entities: Array.from(this.entities.values()),
            relations: Array.from(this.relations.values())
        };
    }
}
